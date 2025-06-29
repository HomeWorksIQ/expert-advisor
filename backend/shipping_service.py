import os
import uuid
import base64
from typing import Optional, Dict, Any, List
from datetime import datetime
from xml.etree import ElementTree as ET
from fastapi import HTTPException
import httpx
import aiofiles
from .api_key_models import APIKeyType


class USPSShippingService:
    def __init__(self, api_key_service):
        self.api_key_service = api_key_service
        self.test_url = "https://secure.shippingapis.com/ShippingAPITest.dll"
        self.prod_url = "https://secure.shippingapis.com/ShippingAPI.dll"
    
    async def get_usps_credentials(self) -> Optional[Dict[str, str]]:
        """Get USPS API credentials"""
        usps_key = await self.api_key_service.get_api_key(APIKeyType.USPS)
        if usps_key:
            return {
                "user_id": usps_key.api_key,
                "password": usps_key.api_secret
            }
        return None
    
    def generate_label_xml(self, to_address: Dict[str, str], from_address: Dict[str, str], 
                          package_info: Dict[str, Any], user_id: str) -> str:
        """Generate XML for USPS eVS Label API"""
        label_request = ET.Element("eVSRequest", USERID=user_id)
        ET.SubElement(label_request, "Revision").text = "1"
        
        # To Address
        to_addr = ET.SubElement(label_request, "ToAddress")
        ET.SubElement(to_addr, "Name").text = to_address["name"]
        ET.SubElement(to_addr, "Firm").text = to_address.get("company", "")
        ET.SubElement(to_addr, "Address1").text = to_address.get("address2", "")
        ET.SubElement(to_addr, "Address2").text = to_address["street"]
        ET.SubElement(to_addr, "City").text = to_address["city"]
        ET.SubElement(to_addr, "State").text = to_address["state"]
        ET.SubElement(to_addr, "Zip5").text = to_address["zip"]
        ET.SubElement(to_addr, "Zip4").text = to_address.get("zip4", "")
        
        # From Address
        from_addr = ET.SubElement(label_request, "FromAddress")
        ET.SubElement(from_addr, "Name").text = from_address["name"]
        ET.SubElement(from_addr, "Firm").text = from_address.get("company", "")
        ET.SubElement(from_addr, "Address1").text = from_address.get("address2", "")
        ET.SubElement(from_addr, "Address2").text = from_address["street"]
        ET.SubElement(from_addr, "City").text = from_address["city"]
        ET.SubElement(from_addr, "State").text = from_address["state"]
        ET.SubElement(from_addr, "Zip5").text = from_address["zip"]
        ET.SubElement(from_addr, "Zip4").text = from_address.get("zip4", "")
        
        # Package Info
        ET.SubElement(label_request, "WeightInOunces").text = str(package_info["weight"])
        ET.SubElement(label_request, "ServiceType").text = package_info.get("service_type", "Priority")
        ET.SubElement(label_request, "Container").text = package_info.get("container", "Variable")
        ET.SubElement(label_request, "Width").text = str(package_info.get("width", 10))
        ET.SubElement(label_request, "Length").text = str(package_info.get("length", 10))
        ET.SubElement(label_request, "Height").text = str(package_info.get("height", 10))
        ET.SubElement(label_request, "Machinable").text = "true"
        
        # Optional fields
        if package_info.get("delivery_confirmation"):
            ET.SubElement(label_request, "ExtraServices").text = "1"  # Delivery Confirmation
        
        return ET.tostring(label_request, encoding='unicode')
    
    def generate_tracking_xml(self, tracking_number: str, user_id: str) -> str:
        """Generate XML for tracking request"""
        track_request = ET.Element("TrackRequest", USERID=user_id)
        track_id = ET.SubElement(track_request, "TrackID", ID=tracking_number)
        return ET.tostring(track_request, encoding='unicode')
    
    def parse_label_response(self, xml_response: str) -> Dict[str, Any]:
        """Parse USPS label response"""
        root = ET.fromstring(xml_response)
        
        # Check for errors
        error = root.find(".//Error")
        if error is not None:
            error_desc = error.find('Description')
            raise Exception(f"USPS Error: {error_desc.text if error_desc is not None else 'Unknown error'}")
        
        # Extract label data
        tracking_number = root.find(".//TrackingNumber")
        label_image = root.find(".//LabelImage")
        postage = root.find(".//Postage")
        
        return {
            "tracking_number": tracking_number.text if tracking_number is not None else "",
            "label_image": label_image.text if label_image is not None else "",
            "postage": postage.text if postage is not None else "0.00"
        }
    
    def parse_tracking_response(self, xml_response: str) -> Dict[str, Any]:
        """Parse USPS tracking response"""
        root = ET.fromstring(xml_response)
        
        # Check for errors
        error = root.find(".//Error")
        if error is not None:
            error_desc = error.find('Description')
            raise Exception(f"USPS Tracking Error: {error_desc.text if error_desc is not None else 'Unknown error'}")
        
        track_info = root.find(".//TrackInfo")
        if track_info is None:
            return {"tracking_number": "", "status": "No tracking information available"}
        
        tracking_number = track_info.get("ID", "")
        track_summary = track_info.find("TrackSummary")
        status = track_summary.text if track_summary is not None else "No tracking info available"
        
        # Get tracking details
        details = []
        for detail in track_info.findall("TrackDetail"):
            details.append({
                "event": detail.text,
                "date": detail.get("Date", ""),
                "time": detail.get("Time", ""),
                "location": detail.get("Location", "")
            })
        
        return {
            "tracking_number": tracking_number,
            "status": status,
            "details": details
        }
    
    async def create_shipping_label(self, to_address: Dict[str, str], from_address: Dict[str, str], 
                                  package_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create shipping label via USPS API"""
        credentials = await self.get_usps_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="USPS credentials not configured")
        
        xml_payload = self.generate_label_xml(
            to_address, from_address, package_info, credentials["user_id"]
        )
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.test_url}?API=eVS",
                data=f"XML={xml_payload}",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=30.0
            )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"USPS API error: {response.text}")
        
        return self.parse_label_response(response.text)
    
    async def track_package(self, tracking_number: str) -> Dict[str, Any]:
        """Track package via USPS API"""
        credentials = await self.get_usps_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="USPS credentials not configured")
        
        xml_payload = self.generate_tracking_xml(tracking_number, credentials["user_id"])
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.test_url}?API=TrackV2",
                data=f"XML={xml_payload}",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=30.0
            )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"USPS Tracking API error: {response.text}")
        
        return self.parse_tracking_response(response.text)
    
    async def validate_address(self, address: Dict[str, str]) -> Dict[str, Any]:
        """Validate address via USPS API"""
        credentials = await self.get_usps_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="USPS credentials not configured")
        
        # Create address validation XML
        address_request = ET.Element("AddressValidateRequest", USERID=credentials["user_id"])
        ET.SubElement(address_request, "Revision").text = "1"
        
        address_elem = ET.SubElement(address_request, "Address", ID="0")
        ET.SubElement(address_elem, "Address1").text = address.get("address2", "")
        ET.SubElement(address_elem, "Address2").text = address["street"]
        ET.SubElement(address_elem, "City").text = address["city"]
        ET.SubElement(address_elem, "State").text = address["state"]
        ET.SubElement(address_elem, "Zip5").text = address["zip"]
        ET.SubElement(address_elem, "Zip4").text = address.get("zip4", "")
        
        xml_payload = ET.tostring(address_request, encoding='unicode')
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.test_url}?API=Verify",
                data=f"XML={xml_payload}",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=30.0
            )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"USPS Address Validation error: {response.text}")
        
        # Parse response
        root = ET.fromstring(response.text)
        error = root.find(".//Error")
        if error is not None:
            error_desc = error.find('Description')
            raise Exception(f"USPS Address Validation Error: {error_desc.text if error_desc is not None else 'Unknown error'}")
        
        address_elem = root.find(".//Address")
        if address_elem is not None:
            return {
                "validated": True,
                "address": {
                    "street": address_elem.find("Address2").text if address_elem.find("Address2") is not None else "",
                    "address2": address_elem.find("Address1").text if address_elem.find("Address1") is not None else "",
                    "city": address_elem.find("City").text if address_elem.find("City") is not None else "",
                    "state": address_elem.find("State").text if address_elem.find("State") is not None else "",
                    "zip": address_elem.find("Zip5").text if address_elem.find("Zip5") is not None else "",
                    "zip4": address_elem.find("Zip4").text if address_elem.find("Zip4") is not None else ""
                }
            }
        
        return {"validated": False, "error": "Could not validate address"}


class UPSShippingService:
    def __init__(self, api_key_service):
        self.api_key_service = api_key_service
        self.test_url = "https://wwwcie.ups.com/api"
        self.prod_url = "https://api.ups.com"
    
    async def get_ups_credentials(self) -> Optional[Dict[str, str]]:
        """Get UPS API credentials"""
        ups_key = await self.api_key_service.get_api_key(APIKeyType.UPS)
        if ups_key:
            return {
                "client_id": ups_key.client_id,
                "client_secret": ups_key.client_secret,
                "access_key": ups_key.api_key
            }
        return None
    
    async def get_access_token(self) -> str:
        """Get UPS OAuth access token"""
        credentials = await self.get_ups_credentials()
        if not credentials:
            raise HTTPException(status_code=404, detail="UPS credentials not configured")
        
        auth_string = f"{credentials['client_id']}:{credentials['client_secret']}"
        auth_header = base64.b64encode(auth_string.encode()).decode()
        
        payload = {
            "grant_type": "client_credentials"
        }
        
        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.test_url}/security/v1/oauth/token",
                data=payload,
                headers=headers
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="UPS authentication failed")
            
            return response.json()["access_token"]
    
    async def create_shipping_label(self, to_address: Dict[str, str], from_address: Dict[str, str], 
                                  package_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create UPS shipping label"""
        access_token = await self.get_access_token()
        credentials = await self.get_ups_credentials()
        
        # UPS Ship API payload
        ship_request = {
            "ShipmentRequest": {
                "Request": {
                    "SubVersion": "1801",
                    "RequestOption": "nonvalidate",
                    "TransactionReference": {
                        "CustomerContext": "Your Test Case Summary Description"
                    }
                },
                "Shipment": {
                    "Description": "Ship WS test",
                    "Shipper": {
                        "Name": from_address["name"],
                        "ShipperNumber": "Your UPS Account Number",
                        "Address": {
                            "AddressLine": [from_address["street"]],
                            "City": from_address["city"],
                            "StateProvinceCode": from_address["state"],
                            "PostalCode": from_address["zip"],
                            "CountryCode": "US"
                        }
                    },
                    "ShipTo": {
                        "Name": to_address["name"],
                        "Address": {
                            "AddressLine": [to_address["street"]],
                            "City": to_address["city"],
                            "StateProvinceCode": to_address["state"],
                            "PostalCode": to_address["zip"],
                            "CountryCode": "US"
                        }
                    },
                    "ShipFrom": {
                        "Name": from_address["name"],
                        "Address": {
                            "AddressLine": [from_address["street"]],
                            "City": from_address["city"],
                            "StateProvinceCode": from_address["state"],
                            "PostalCode": from_address["zip"],
                            "CountryCode": "US"
                        }
                    },
                    "PaymentInformation": {
                        "ShipmentCharge": {
                            "Type": "01",
                            "BillShipper": {
                                "AccountNumber": "Your UPS Account Number"
                            }
                        }
                    },
                    "Service": {
                        "Code": package_info.get("service_code", "03"),  # Ground
                        "Description": package_info.get("service_description", "Ground")
                    },
                    "Package": {
                        "Description": "Package",
                        "Packaging": {
                            "Code": "02",
                            "Description": "Package"
                        },
                        "Dimensions": {
                            "UnitOfMeasurement": {
                                "Code": "IN",
                                "Description": "Inches"
                            },
                            "Length": str(package_info.get("length", 10)),
                            "Width": str(package_info.get("width", 10)),
                            "Height": str(package_info.get("height", 10))
                        },
                        "PackageWeight": {
                            "UnitOfMeasurement": {
                                "Code": "LBS",
                                "Description": "Pounds"
                            },
                            "Weight": str(package_info.get("weight", 1))
                        }
                    }
                },
                "LabelSpecification": {
                    "LabelImageFormat": {
                        "Code": "GIF",
                        "Description": "GIF"
                    },
                    "HTTPUserAgent": "Mozilla/4.5"
                }
            }
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "transId": str(uuid.uuid4()),
            "transactionSrc": "testing",
            "AccessLicenseNumber": credentials["access_key"]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.test_url}/shipments/v1801/ship",
                json=ship_request,
                headers=headers
            )
            
            if response.status_code not in [200, 201]:
                raise HTTPException(status_code=400, detail=f"UPS API error: {response.text}")
            
            result = response.json()
            shipment_response = result["ShipmentResponse"]
            
            return {
                "tracking_number": shipment_response["ShipmentResults"]["ShipmentIdentificationNumber"],
                "label_image": shipment_response["ShipmentResults"]["PackageResults"]["ShippingLabel"]["GraphicImage"],
                "total_charges": shipment_response["ShipmentResults"]["ShipmentCharges"]["TotalCharges"]["MonetaryValue"]
            }


class ShippingLabelService:
    def __init__(self, api_key_service, db):
        self.api_key_service = api_key_service
        self.db = db
        self.usps_service = USPSShippingService(api_key_service)
        self.ups_service = UPSShippingService(api_key_service)
    
    async def create_shipping_label(self, provider: str, to_address: Dict[str, str], 
                                  from_address: Dict[str, str], package_info: Dict[str, Any], 
                                  order_id: Optional[str] = None) -> Dict[str, Any]:
        """Create shipping label with specified provider"""
        if provider == "usps":
            label_data = await self.usps_service.create_shipping_label(to_address, from_address, package_info)
        elif provider == "ups":
            label_data = await self.ups_service.create_shipping_label(to_address, from_address, package_info)
        else:
            raise HTTPException(status_code=400, detail="Unsupported shipping provider")
        
        # Save shipping record to database
        shipping_record = {
            "shipping_id": str(uuid.uuid4()),
            "order_id": order_id,
            "provider": provider,
            "tracking_number": label_data["tracking_number"],
            "to_address": to_address,
            "from_address": from_address,
            "package_info": package_info,
            "label_image": label_data["label_image"],
            "shipping_cost": label_data.get("postage") or label_data.get("total_charges"),
            "status": "label_created",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await self.db.shipping_labels.insert_one(shipping_record)
        
        return {
            "shipping_id": shipping_record["shipping_id"],
            "tracking_number": label_data["tracking_number"],
            "label_image": label_data["label_image"],
            "shipping_cost": shipping_record["shipping_cost"]
        }
    
    async def track_shipment(self, tracking_number: str, provider: str) -> Dict[str, Any]:
        """Track shipment with specified provider"""
        if provider == "usps":
            return await self.usps_service.track_package(tracking_number)
        elif provider == "ups":
            # UPS tracking would be implemented here
            raise HTTPException(status_code=501, detail="UPS tracking not implemented yet")
        else:
            raise HTTPException(status_code=400, detail="Unsupported shipping provider")
    
    async def save_label_image(self, shipping_id: str, label_image_base64: str) -> str:
        """Save label image to file system"""
        # Create labels directory if it doesn't exist
        labels_dir = "/app/downloads/labels"
        os.makedirs(labels_dir, exist_ok=True)
        
        # Decode base64 image
        image_data = base64.b64decode(label_image_base64)
        
        # Generate filename
        filename = f"label_{shipping_id}_{datetime.utcnow().isoformat()}.png"
        file_path = os.path.join(labels_dir, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(image_data)
        
        return file_path
    
    async def get_shipping_labels_by_performer(self, performer_id: str) -> List[Dict[str, Any]]:
        """Get all shipping labels for a performer"""
        labels = await self.db.shipping_labels.find({"performer_id": performer_id}).to_list(1000)
        
        for label in labels:
            label["_id"] = str(label["_id"])
        
        return labels
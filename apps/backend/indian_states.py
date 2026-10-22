"""
Canonical list of all 28 Indian States and 8 Union Territories
Approved for Indian Billing Address validation.
"""

INDIAN_STATES_AND_UTS = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
]

APPROVED_STATES_SET = {s.lower(): s for s in INDIAN_STATES_AND_UTS}

def normalize_and_validate_state(state_name: str) -> str:
    """
    Validates state against canonical Indian States & UTs.
    Returns the canonical capitalized state name if valid, or empty string.
    """
    if not state_name:
        return ""
    clean = state_name.strip().lower()
    return APPROVED_STATES_SET.get(clean, "")

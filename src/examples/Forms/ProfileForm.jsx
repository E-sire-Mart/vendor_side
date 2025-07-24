// examples/Forms/ProfileForm.jsx
import { useState, useEffect } from 'react';
import MDBox from '../../components/MDBox';
import MDTypography from '../../components/MDTypography';
import MDInput from '../../components/MDInput';
import MDSelect from '../../components/MDSelect/MDSelect';
import MDButton from '../../components/MDButton';
import ShopService from '../../services/shop-service.js';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';

function ProfileForm({ onClose, initialProfile }) {
    const [profileName, setProfileName] = useState('');
    const [profileDesc, setProfileDesc] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationFetched, setLocationFetched] = useState(false); // Track if location has been fetched
    const [profileSocialMedia, setProfileSocialMedia] = useState({
        facebook: '',
        twitter: '',
        instagram: '',
    });

    useEffect(() => {
        if (initialProfile) {
            setProfileName(initialProfile.name || '');
            setProfileDesc(initialProfile.description || '');
            setProfileSocialMedia(initialProfile.socialMedia || {
                facebook: '',
                twitter: '',
                instagram: '',
            });
            if (initialProfile.shop_location) {
                setSelectedLocation(initialProfile.shop_location);
                setLocationFetched(true); // Assume location is fetched if provided initially
            }
        }
    }, [initialProfile]);

    function getLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            });
        });
    }

    const fetchAndSetLocation = async () => {
        try {
            const position = await getLocation();
            const { latitude, longitude } = position.coords;
            setSelectedLocation({ lat: latitude, lng: longitude });
            setLocationFetched(true); // Set location as fetched
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const profileData = {
            name: profileName,
            description: profileDesc,
            socialMedia: profileSocialMedia,
            shop_location: selectedLocation
        };

        if (selectedLocation != null) {
            try {
                const response = await ShopService.update(profileData, { 'Content-Type': 'application/json' });
                console.log('Profile updated successfully:', response);
                onClose();
            } catch (error) {
                console.error('Error updating/saving Profile:', error);
            }
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            <MDBox p={2}>
                <MDBox mb={2}>
                    <MDInput
                        type="text"
                        label="Shop Name"
                        fullWidth
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                    />
                </MDBox>
                <MDBox mb={2}>
                    <MDInput
                        type="text"
                        label="Shop Description"
                        fullWidth
                        value={profileDesc}
                        onChange={(e) => setProfileDesc(e.target.value)}
                        required
                        multiline   // This makes the input behave as a textarea
                        rows={4}    // Number of rows (adjust as needed)
                    />
                </MDBox>

                <MDBox mb={2}>
                    <MDInput
                        type="text"
                        label="Facebook"
                        fullWidth
                        value={profileSocialMedia.facebook}
                        onChange={(e) => setProfileSocialMedia({ ...profileSocialMedia, facebook: e.target.value })}
                    />
                </MDBox>
                <MDBox mb={2}>
                    <MDInput
                        type="text"
                        label="Twitter"
                        fullWidth
                        value={profileSocialMedia.twitter}
                        onChange={(e) => setProfileSocialMedia({ ...profileSocialMedia, twitter: e.target.value })}
                    />
                </MDBox>
                <MDBox mb={2}>
                    <MDInput
                        type="text"
                        label="Instagram"
                        fullWidth
                        value={profileSocialMedia.instagram}
                        onChange={(e) => setProfileSocialMedia({ ...profileSocialMedia, instagram: e.target.value })}
                    />
                </MDBox>
                <MDBox mb={2} display="flex" justifyContent="center">
                    <MDButton variant="contained" color="secondary" onClick={fetchAndSetLocation}>
                        Set to Current Location
                    </MDButton>
                </MDBox>

                <MDBox display="flex" justifyContent="center" mb={2} p={2}>
                    <MDButton variant="gradient" color="info" type="submit" disabled={!locationFetched}>
                        Update
                    </MDButton>
                </MDBox>
            </MDBox>
        </form>
    );
}

function getLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });
    });
}


export default ProfileForm;

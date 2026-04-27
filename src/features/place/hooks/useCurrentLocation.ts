import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const FALLBACK_COORD = { lat: 37.402001, lng: 127.108678 }; // 임의의 위치

export const useCurrentLocation = () => {
    const [center, setCenter] = useState(FALLBACK_COORD);

    useEffect(() => {
        let mounted = true;
        let subscription: Location.LocationSubscription | null = null;

        const initLocation = async () => {
        try {
            // 위치 권한 요청
            const { status } = await Location.requestForegroundPermissionsAsync();
            // 실패/거부 시 fallback
            if (status !== 'granted') {
            if (mounted) setCenter(FALLBACK_COORD);
            return;
            }

            const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            });
            if (!mounted) return;

            setCenter({
            lat: current.coords.latitude,
            lng: current.coords.longitude,
            });

            const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 5000,
                distanceInterval: 10,
                },
                (loc) => {
                    if (!mounted) return;
                    setCenter({
                    lat: loc.coords.latitude,
                    lng: loc.coords.longitude,
                });
            }
            );

            if (!mounted) {
            sub.remove();
            } else {
            subscription = sub;
            }
        } catch {
            if (mounted) setCenter(FALLBACK_COORD);
        }
        };

        initLocation();

        return () => {
        mounted = false;
        subscription?.remove();
        subscription = null;
        };
    }, []);

    return { center, userLat: center.lat, userLng: center.lng, followUser: true };
};

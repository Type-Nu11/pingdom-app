import React,{useEffect,useState} from "react";
import * as Location from 'expo-location';

const FALLBACK_COORD = { lat: 37.402001, lng: 127.108678} //임의의 위치
export const useCurrentLocation = () => {
    const [center,setCenter] = useState(FALLBACK_COORD);
    useEffect(() => {
    const requestPermission = async () => {
        const {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
        console.log('위치 권한 거부')
        return;
        }
        console.log('위치 권한 허용도')
    }
    requestPermission();
    })
}
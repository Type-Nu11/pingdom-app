import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

type props = {
    title: string
}

export default function Button({title}: props) {
    return (
        <View>
            <Text>{title}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    
})
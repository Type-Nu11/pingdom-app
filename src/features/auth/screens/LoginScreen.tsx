import React from 'react';
import { View,StyleSheet, } from 'react-native';

export default function LoginScreen() {
  return (
    <View>
      <input placeholder='아이디'></input>
      <input placeholder='비밀번호'></input>
      <button>로그인</button>
    </View>
  )
}

const styles = StyleSheet.create({

})
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';


import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;



function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isWashing, setIsWashing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [pressureData, setPressureData] = useState(null);
  const [turbidityData, setTurbidityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.22.47/data');
      const data = await response.json();

      // Assume data1 for water pressure and data3 for turbidity
      setPressureData(data.data1['adc-value']);
      setTurbidityData(data.data3['adc-value']);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Fungsi yang akan dipanggil saat tombol ditekan
  const handleButtonPress = () => {
    setIsWashing(true);
    // Setelah 3 detik, setel isWashing ke false dan isCompleted ke true
    setTimeout(() => {
      setIsWashing(false);
      setIsCompleted(true);
      // Setelah 2 detik, setel isCompleted ke false
      setTimeout(() => {
        setIsCompleted(false);
      }, 2000); // 2000 milidetik = 2 detik
    }, 3000); // 3000 milidetik = 3 detik
  };

  const handleButtonPress1 = async () => {
    setIsWashing(true);
  
    try {
      const response = await fetch('http://192.168.22.47/post-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relay1: true,
          relay2: true,
          relay3: true,
          relay4: true,
        }),
      });
  
      const result = await response.json();
  
      if (result.status === 'success') {
        setIsWashing(false);
        setIsCompleted(true);
        setTimeout(() => {
          setIsCompleted(false);
        }, 2000); // 2000 milidetik = 2 detik
      } else {
        // Handle failure (optional)
        setIsWashing(false);
        Alert.alert('Error', 'Failed to start washing process');
      }
    } catch (error) {
      console.error(error);
      setIsWashing(false);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[backgroundStyle, styles.scrollView]}>
        {/* Konten Tetap */}
        <View >
          <View style={styles.rectangle}>
            <Text style={styles.text}>Auto Clean Monitoring</Text>
          </View>
        </View>
        
        {/* Konten Dinamis */}
        <View style={styles.content}>
          {isWashing ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>Washing On Process..</Text>
            </View>
          ) : isCompleted ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>Completed</Text>
            </View>
          ) : (
            <View >
              <View style={styles.rectangle1Style}>
                <View style={styles.rectangle1}>
                  <View style={styles.iconRow}>
                    <View style={styles.icons}>
                      <Icon name="speedometer-outline" size={30} color="#000" style={styles.icon} />
                      <Text style={styles.iconText}>Pressure Sensor</Text>
                    </View>
                    <View style={styles.rectangle2}>
                      <Text style={styles.cencorText}>High</Text>
                    </View>
                  </View>
                  <View style={styles.score}>
                    {/* <Text style={styles.text1}>{pressureData}</Text> */}
                    <Text style={styles.text1}>89/89</Text>
                    <Text style={styles.text2}>ATM</Text>
                  </View>
                </View>
                <View style={styles.rectangle1}>
                  <View style={styles.iconRow}>
                    <View style={styles.icons}>
                      <Icon name="water-outline" size={30} color="#000" style={styles.icon} />
                      <Text style={styles.iconText}>Turbidity Sensor</Text>
                    </View>
                    <View style={styles.rectangle2}>
                      <Text style={styles.cencorText}>bitlongtext</Text>
                    </View>
                  </View>
                  <View style={styles.score}>
                    {/* <Text style={styles.text1}>{turbidityData}</Text> */}
                    <Text style={styles.text1}>13,9/81.9</Text>
                    <Text style={styles.text2}>ATM</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      {!isWashing && !isCompleted && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
            <Text style={styles.buttonText}>Wash It!</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    backgroundColor: 'white', // Setel latar belakang putih untuk ScrollView
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    // padding: 20,
  },
  contentContainer: {
    flex: 1,
    // justifyContent: 'space-between',
    // paddingHorizontal: 20,
  },
  highlight: {
    fontWeight: '700',
  },
  rectangle: {
    width: '100%', // Lebar rectangle
    height: 100, // Tinggi rectangle
    backgroundColor: 'blue', // Warna background rectangle
    // marginBottom: 24,
    // borderRadius: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: 'center', // Menyelaraskan teks secara vertikal di tengah
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#FFFFFF',
    
  },
  rectangle1Style: {
    marginTop: '40%',
    alignItems: 'center'
  },
  rectangle1: {
    width: '90%', // Lebar rectangle
    height: 150, // Tinggi rectangle
    backgroundColor: 'whitesmoke', // Warna background rectangle
    // marginTop: '30%',
    marginBottom: 30,
    borderRadius: 20,
    justifyContent: 'space-between',
    // alignItems: 'center',
    // Bayangan untuk iOS
    shadowColor: '#000', // Warna bayangan
    shadowOffset: { width: 0, height: 4 }, // Offset bayangan
    shadowOpacity: 0.3, // Opacity bayangan
    shadowRadius: 6, // Radius blur bayangan
    // Bayangan untuk Android
    elevation: 8, // Elevasi bayangan
    padding: 10
  },
  score:{
    flexDirection:'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
  },
  text1: {
    fontSize: 36,
    color: 'blue',
    
  },
  text2:{
    fontSize: 12,
    color: 'blue',
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
    paddingBottom: 25
  },
  button: {
    backgroundColor: 'blue', // Warna latar belakang tombol
    width: '80%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    elevation: 3, // Efek bayangan Android
    shadowColor: '#000', // Efek bayangan iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    // alignSelf: 'center'
  },
  buttonText: {
    color: '#FFFFFF', // Warna teks tombol
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ruang antara ikon dan rectangle2
    width: '100%',
  },
  icon: {
    marginRight: 10, // Tambahkan margin kanan agar ikon tidak menempel pada teks
  },
  rectangle2: {
    // width: 100,
    height: 30,
    backgroundColor: 'red',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  cencorText: {
    color: '#FFFFFF', // Warna teks tombol
    fontSize: 16,
  },
  icons:{
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconText:{
    color: 'grey',
    fontSize: 14
  },
  messageContainer: {
    paddingTop: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    // flex: 1,
  },
  messageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'blue',
  },
});

export default App;

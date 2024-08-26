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
  Alert
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';

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

const API = {
  baseURL: 'http://10.168.43.1:3000',
  // baseURL: 'http://localhost:3000'
};



function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isWashing, setIsWashing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pressureData1, setPressureData1] = useState(0);
  const [pressureData2, setPressureData2] = useState(0);
  const [turbidityData, setTurbidityData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Washing On Process');
  


  // const handleBackgroundTask = async () => {
  //   try {
  //     const processStatus = await AsyncStorage.getItem('processStatus');

  //     if (processStatus) {
  //       const { isWashing, progress } = JSON.parse(processStatus);

  //       if (isWashing) {
  //         // Lanjutkan proses jika diperlukan
  //         console.log('Continuing process...');

  //         // Kirim POST request untuk melanjutkan proses
  //         await fetch(`${API.baseURL}/post-relay`, {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             "relay1": true,
  //             "relay2": true,
  //             "relay3": false,
  //             "relay4": false,
  //           }),
  //         });

  //         // Update status proses di AsyncStorage jika diperlukan
  //         await AsyncStorage.setItem('processStatus', JSON.stringify({
  //           isWashing: false,
  //           progress: 0,
  //         }));
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Failed to handle background task:', error);
  //   }
  // };

  useEffect(() => {
    const initializeState = async () => {
      try {
        // Ambil nilai dari AsyncStorage
        const savedIsWashing = await AsyncStorage.getItem('isWashing');
        const savedIsCompleted = await AsyncStorage.getItem('isCompleted');
        const savedProgress = await AsyncStorage.getItem('progress');

        // Set nilai state jika ada
        if (savedIsWashing !== null) setIsWashing(JSON.parse(savedIsWashing));
        if (savedIsCompleted !== null) setIsCompleted(JSON.parse(savedIsCompleted));
        if (savedProgress !== null) setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Failed to load state from storage:', error);
      }
    };

    initializeState();
  }, []);

  useEffect(() => {
    const saveStateToStorage = async () => {
      try {
        await AsyncStorage.setItem('isWashing', JSON.stringify(isWashing));
        await AsyncStorage.setItem('isCompleted', JSON.stringify(isCompleted));
        await AsyncStorage.setItem('progress', JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to save state to storage:', error);
      }
    };

    saveStateToStorage();
  }, [isWashing, isCompleted, progress]);
  



  useEffect(() => {
    if (isWashing === true) {
      const totalDuration = 180000;
      const interval = 1000;
      const steps = totalDuration / interval;
      const stepIncrement = 1 / steps;

      const progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + stepIncrement;
          console.log(`Progress: ${Math.min(Math.round(newProgress * 100), 100)}%`);
          if (newProgress >= 1) {
            clearInterval(progressInterval);
          }
          return newProgress;
        }); 
      }, interval);

      return () => clearInterval(progressInterval); // Clean up interval on unmount
    }
  }, [isWashing]);

  const percentage = Math.min(Math.round(progress * 100), 100);

  useEffect(() => {
    if (isWashing) {
      const loadingInterval = setInterval(() => {
        setLoadingText(prev => {
          if (prev.endsWith('...')) {
            return 'Washing On Process';
          } else {
            return prev + '.';
          }
        });
      }, 500); // Adjust the speed of the animation here

      return () => clearInterval(loadingInterval);
    }
  }, [isWashing]);

  const convertToPSI = (rawValue:number, maxValue = 65535, maxPSI = 100) => {
    return (rawValue / maxValue) * maxPSI;
  };

  const convert16BitToNTU = (value:number) => {
    const max16BitValue = 65535;
    const maxNTU = 1000;
  
    return (value / max16BitValue) * maxNTU;
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${API.baseURL}/data-sensor`);
      const data = await response.json();
  
      // Ambil nilai 16-bit dari data sensor
      const rawPressureData1 = data.data1['adc-value'];
      const rawPressureData2 = data.data2['adc-value'];
      const rawTurbidityData = data.data3['adc-value'];
  
      // Konversi nilai 16-bit menjadi PSI dan batasi hingga 3 angka di belakang koma
      const pressureData1PSI = convertToPSI(rawPressureData1).toFixed(2);
      const pressureData2PSI = convertToPSI(rawPressureData2).toFixed(2);
      const turbidityDataPSI = convert16BitToNTU(rawTurbidityData).toFixed(2);
  
      // Set nilai PSI ke state
      setPressureData1(parseFloat(pressureData1PSI));
      setPressureData2(parseFloat(pressureData2PSI));
      setTurbidityData(parseFloat(turbidityDataPSI));
  
      setLoading(false);
    } catch (error) {
      console.error(error);
      // Set nilai default jika terjadi error
      setPressureData1(0);
      setPressureData2(0);
      setTurbidityData(0);
    }
  };

    useEffect(() => {
      // Fetch data pertama kali
      fetchData();

      // Set interval untuk polling data setiap 5 detik (5000 ms)
      const interval = setInterval(() => {
        fetchData();
      }, 5000);

      // Membersihkan interval saat komponen unmount
      return () => clearInterval(interval);
    }, []);


  const handleButtonPress = async () => {
    setIsWashing(true);
    setProgress(0);
  
    try {
      // Kirim POST request pertama
      const response = await fetch(`${API.baseURL}/post-relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "relay1": false,
          "relay2": false,
          "relay3": true,
          "relay4": true,
        }),
      });
  
      const result = await response.json();
      console.log('First POST response:', result);
  
      if (result.status === 'success') {
        setTimeout(async () => {
          
            console.log('Sending second POST request...');
            const secondResponse = await fetch(`${API.baseURL}/post-relay`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                "relay1": true,
                "relay2": true,
                "relay3": false,
                "relay4": false,
              }),
            });
  
            const secondResult = await secondResponse.json();
            console.log('Second POST response:', secondResult);
  
            if (secondResult.status === 'success') {
              setIsWashing(false);
              setIsCompleted(true);
              setTimeout(() => {
                setIsCompleted(false);
              }, 2000); // 2000 milidetik = 2 detik
              fetchData();
          } else {
            console.log('Washing process was stopped before the second request.');
          } 
        }, 180000); 
      } else {
        setIsWashing(false);
        Alert.alert('Error', 'Failed to start washing process');
      }
    } catch (error) {
      console.error(error);
      setIsWashing(false);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const handleCancel = async () => {
    try {
      // Kirim POST request untuk membatalkan proses
      const response = await fetch(`${API.baseURL}/post-relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "relay1": true,
          "relay2": true,
          "relay3": false,
          "relay4": false,
        }),
      });

      const result = await response.json();
      console.log('Cancel POST response:', result);

      // Reset semua state
      setIsWashing(false);
      setIsCompleted(false);
      setProgress(0);
    } catch (error) {
      console.error('Error cancelling process:', error);
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
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.messageText}>{loadingText}</Text>
            <View style={styles.progressBarContainer}>
              <Progress.Bar
                progress={progress}
                width={300}
                height={30}
                color="#4caf50"
                borderRadius={10}
              />
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
            </View>
          ) : isCompleted ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>Completed</Text>
            </View>
          ) : (
            
            <View >
              <View>
                <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
                  <Icon name="refresh-outline" size={30} color="#000" />
                </TouchableOpacity>
              </View>
              <View style={styles.rectangle1Style}>
              
                <View style={styles.rectangle1}>
                  <View style={styles.iconRow}>
                    <View style={styles.icons}>
                      <Icon name="speedometer-outline" size={30} color="#000" style={styles.icon} />
                      <Text style={styles.iconText}>Pressure Inlet Sensor</Text>
                    </View>
                    <View style={styles.rectangle2}>
                      <Text style={styles.cencorText}></Text>
                    </View>
                  </View>
                  <View style={styles.score}>
                    <Text style={styles.text1}>{pressureData1}/100</Text>
                    <Text style={styles.text2}>PSI</Text>
                  </View>
                </View>

                <View style={styles.rectangle1}>
                  <View style={styles.iconRow}>
                    <View style={styles.icons}>
                      <Icon name="speedometer-outline" size={30} color="#000" style={styles.icon} />
                      <Text style={styles.iconText}>Pressure Outlet Sensor</Text>
                    </View>
                    <View style={styles.rectangle2}>
                      <Text style={styles.cencorText}></Text>
                    </View>
                  </View>
                  <View style={styles.score}>
                    <Text style={styles.text1}>{pressureData2}/100</Text>
                    <Text style={styles.text2}>PSI</Text>
                  </View>
                </View>

                <View style={styles.rectangle1}>
                  <View style={styles.iconRow}>
                    <View style={styles.icons}>
                      <Icon name="water-outline" size={30} color="#000" style={styles.icon} />
                      <Text style={styles.iconText}>Turbidity Sensor</Text>
                    </View>
                    <View style={styles.rectangle2}>
                      <Text style={styles.cencorText}></Text>
                    </View>
                  </View>
                  <View style={styles.score}>
                    <Text style={styles.text1}>{turbidityData}/1000</Text>
                    {/* <Text style={styles.text1}>13,9/81.9</Text> */}
                    <Text style={styles.text2}>NTU</Text>
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
    marginTop: '10%',
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
    // backgroundColor: 'red',
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
    paddingTop: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    // flex: 1,
  },
  messageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'blue',
  },
  refreshButton: {
    alignSelf: 'flex-end',
    marginTop: '5%'
  },
  progressBar: {
    marginTop: 10,
  },
  progressBarContainer: {
    marginTop: '5%',
    width: 300,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  percentageText: {
    position: 'absolute',
    color: 'blue',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default App;


import React, { Component } from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';

import MapView from 'react-native-maps';
import Pusher from 'pusher-js/react-native';

import * as Location from 'expo-location';

import Geolocation from 'react-native-geolocation-service';
import Modal from 'react-native-modal';
import Config from 'react-native-config';

import { regionFrom } from '../helpers/location';

const CHANNELS_APP_KEY = Config.CHANNELS_APP_KEY;
const CHANNELS_APP_CLUSTER = Config.CHANNELS_APP_CLUSTER;
const BASE_URL = Config.NGROK_HTTPS_URL;

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

export default class Tracking extends Component {
  static navigationOptions = ({ navigation }) => {
    const showHeaderButton = navigation.getParam('showHeaderButton');
    return {
      title: 'Order Map',
      headerRight: showHeaderButton ? (
        <View style={styles.navHeaderRight}>
          <Button
            onPress={navigation.getParam('headerButtonAction')}
            title={navigation.getParam('headerButtonLabel')}
            color="#e19400"
          />
        </View>
      ) : null,
    };
  };

  state = {
    locationPermission: 'undetermined',
    isOrderDetailsModalVisible: false,
    customer: null, // customer info
    currentLocation: null, // driver's current location
    hasOrder: false, // whether the driver is currently handling an order or not
    restaurantAddress: '',
    customerAddress: '',
  };

  constructor(props) {
    super(props);

    this.user_id = 'johndoe';
    this.user_name = 'John Doe';
    this.user_type = 'driver';

    this.available_drivers_channel = null; // this is where customer will send a request to any available driver

    this.ride_channel = null; // the channel used for communicating the current location
    // for a specific order. Channel name is the customer's username

    this.pusher = null; // the pusher client
  }

  async componentDidMount() {
    // this.props.navigation.setParams({
    //   headerButtonLabel: 'Picked Order',
    //   headerButtonAction: this._pickedOrder,
    // });

    // this.pusher = new Pusher(CHANNELS_APP_KEY, {
    //   authEndpoint: `${BASE_URL}/pusher/auth`,
    //   cluster: CHANNELS_APP_CLUSTER,
    //   encrypted: true,
    // });

    // this.available_drivers_channel = this.pusher.subscribe(
    //   'private-available-drivers',
    // );

    // this.available_drivers_channel.bind('pusher:subscription_succeeded', () => {
    //   this.available_drivers_channel.bind(
    //     'client-driver-request',
    //     order_data => {
    //       if (!this.state.hasOrder) {
    //         // if the driver has currently no order
    //         this.setState({
    //           isOrderDetailsModalVisible: true,
    //           customer: order_data.customer,
    //           restaurantLocation: {
    //             latitude: order_data.restaurant_location[0],
    //             longitude: order_data.restaurant_location[1],
    //           },
    //           customerLocation: order_data.customer_location,

    //           restaurantAddress: order_data.restaurant_address,
    //           customerAddress: order_data.customer_address,
    //         });
    //       }
    //     },
    //   );
    // });


    let { status } = await Location.requestForegroundPermissionsAsync();


    if (status === 'granted') {
      let currentLocation = await Location.getCurrentPositionAsync();

      const { latitude, longitude, accuracy } = currentLocation.coords;
      currentLocation = regionFrom(latitude, longitude, accuracy);

      this.setState({
        currentLocation
      });



      this.watch_location_id = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High }, position => {

          const { latitude, longitude, accuracy } = position.coords;
          currentLocation = regionFrom(latitude, longitude, accuracy);

          this.setState({
            currentLocation,
          });
        },
      );
    }

    this.setState({
      status: status,
    });
  }



  render() {
    const {
      currentLocation
    } = this.state;

    return (
      <View style={styles.wrapper}>
        <MapView region={currentLocation} style={styles.map} >
          {currentLocation && (
            <MapView.Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title={"You're here"}
            />
          )}
        </MapView>
      </View>
    );
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.watch_location_id);
  }
}

//

const styles = StyleSheet.create({
  navHeaderRight: {
    marginRight: 10,
  },
  wrapper: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: '2%',
    left: '2%',
    alignSelf: 'flex-end',
  },
  modal: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  close: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    color: '#0366d6',
  },
  modalBody: {
    marginTop: 20,
  },
  addressContainer: {
    marginBottom: 20,
  },
  labelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 10,
  },
});


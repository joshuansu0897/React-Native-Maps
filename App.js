import React, { Component } from "react";
import { StyleSheet, Dimensions, View } from "react-native";

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Polyline from '@mapbox/polyline';

import GOOGLE_API_KEY from './tokenGoogle'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      concat: null,
      coords: [],
      x: 'false',
      cordLatitude: 29.091201,
      cordLongitude: -110.968367,
    };

    this.mergeLot = this.mergeLot.bind(this);

  }

  componentDidMount() {
    navigator.geolocation.watchPosition(
      (position) => {
        console.log('---position---')
        console.log(position.coords)
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
        this.mergeLot();
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: false, timeout: 2000, maximumAge: 1000 },
    );

  }

  mergeLot() {
    if (this.state.latitude != null && this.state.longitude != null) {
      let concatLot = this.state.latitude + "," + this.state.longitude
      this.setState({
        concat: concatLot
      }, () => {
        this.getDirections(concatLot, "29.091201,-110.968367");
      });
    }

  }
  async getDirections(startLoc, destinationLoc) {

    try {
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_API_KEY}`)

      let respJson = await resp.json();
      console.log(respJson)
      console.log(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_API_KEY}`)

      let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1]
        }
      })
      this.setState({ coords: coords })
      this.setState({ x: "true" })
      return coords
    } catch (error) {
      console.log(error)
      this.setState({ x: "error" })
      return error
    }
  }

  render() {
    return (
      <View>
        <MapView style={styles.map} provider={PROVIDER_GOOGLE} initialRegion={{
          latitude: 29.105995525605977,
          longitude: -110.95119637437166,
          latitudeDelta: 0.10,
          longitudeDelta: 0.10
        }}>

          {!!this.state.latitude && !!this.state.longitude && <MapView.Marker
            coordinate={{ "latitude": this.state.latitude, "longitude": this.state.longitude }}
            title={"Your Location"}
          />}

          {!!this.state.cordLatitude && !!this.state.cordLongitude && <MapView.Marker
            coordinate={{ "latitude": this.state.cordLatitude, "longitude": this.state.cordLongitude }}
            title={"Your Destination"}
          />}

          {!!this.state.latitude && !!this.state.longitude && this.state.x == 'true' && <MapView.Polyline
            coordinates={this.state.coords}
            strokeWidth={2}
            strokeColor="red" />
          }

          {!!this.state.latitude && !!this.state.longitude && this.state.x == 'error' && <MapView.Polyline
            coordinates={[
              { latitude: this.state.latitude, longitude: this.state.longitude },
              { latitude: this.state.cordLatitude, longitude: this.state.cordLongitude },
            ]}
            strokeWidth={2}
            strokeColor="red" />
          }
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
});

export default App;
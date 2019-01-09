import React, { Component } from "react"
import { StyleSheet, Dimensions } from 'react-native'

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import Polyline from '@mapbox/polyline'
import { Container, Header, Item, Input, Icon, Button, Text } from 'native-base';

import GOOGLE_API_KEY from './tokenGoogle'

let { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
const LATITUDE = 0
const LONGITUDE = 0
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

class App extends Component {
  constructor() {
    super()
    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      // Destination
      cordLatitude: 29.091201,
      cordLongitude: -110.968367,
      coords: null,
    }

    this.mergeLot = this.mergeLot.bind(this)
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        })
        this.mergeLot()
      },
      (error) => console.log(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    )
  }
  componentDidMount() {
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        })
        this.mergeLot()
      },
      (error) => console.log(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, useSignificantChanges: false, distanceFilter: 8 },
    )
  }
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID)
  }

  mergeLot() {
    if (this.state.region != null) {
      let concatLot = this.state.region.latitude + "," + this.state.region.longitude
      this.getDirections(concatLot, this.state.cordLatitude + "," + this.state.cordLongitude)
    }
  }

  async getDirections(startLoc, destinationLoc) {
    try {
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_API_KEY}`)

      let respJson = await resp.json()
      console.log(respJson)
      console.log(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_API_KEY}`)

      let points = Polyline.decode(respJson.routes[0].overview_polyline.points)
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1]
        }
      })
      this.setState({ coords: coords })
      return coords
    } catch (error) {
      console.log(error)
      return error
    }
  }
  render() {
    return (
      <Container>
        <Header searchBar rounded>
          <Item>
            <Icon name="ios-search" />
            <Input placeholder="Search" />
            <Icon type="Entypo" name="location" />
          </Item>
          <Button transparent>
            <Text>Search</Text>
          </Button>
        </Header>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.container}
          // customMapStyle={MapStyle}
          showsUserLocation={true}
          initialRegion={this.state.region}
        >

          {!!this.state.cordLatitude && !!this.state.cordLongitude && <MapView.Marker
            coordinate={{ "latitude": this.state.cordLatitude, "longitude": this.state.cordLongitude }}
            title={"Your Destination"}
          />}

          {this.state.coords != null && <MapView.Polyline
            coordinates={this.state.coords}
            strokeWidth={2}
            strokeColor="red" />
          }
        </MapView>
      </Container>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
  }
})

export default App
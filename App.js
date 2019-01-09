import React, { Component } from "react"
import { StyleSheet, Dimensions } from 'react-native'

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import Polyline from '@mapbox/polyline'
import { Container, Header, Item, Input, Icon, Button, Text, Content, Footer, FooterTab } from 'native-base';

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
      cordLatitude: null,
      cordLongitude: null,
      coords: null,
      direction: null,
      searchText: null,
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
      if (this.state.cordLatitude != null && this.state.cordLongitude != null) {
        this.getDirections(concatLot, this.state.cordLatitude + "," + this.state.cordLongitude)
      }
    }
  }

  searchPlace = () => {
    this.getPlace(this.state.searchText)
  }

  async getPlace(address) {
    try {
      let resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_API_KEY}`)
      let respJson = await resp.json()

      let { lat, lng } = respJson.results[0].geometry.location
      this.setState({ cordLatitude: lat })
      this.setState({ cordLongitude: lng })

      this.mergeLot()

      return {
        lat,
        lng
      }
    } catch (error) {
      console.log(error)
      return error
    }
  }

  async getDirections(startLoc, destinationLoc) {
    try {
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_API_KEY}`)

      let respJson = await resp.json()

      let points = Polyline.decode(respJson.routes[0].overview_polyline.points)
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1]
        }
      })
      this.setState({ direction: respJson.routes[0].legs[0].steps[0].html_instructions })
      this.setState({ coords: coords })
      return coords
    } catch (error) {
      console.log(error)
      return error
    }
  }

  updateFormField = fieldName => text => {
    this.setState({ [fieldName]: text })
  }

  render() {
    return (
      <Container>
        <Header searchBar rounded>
          <Item>
            <Icon name="ios-search" />
            <Input
              onChangeText={this.updateFormField('searchText')}
              placeholder="Search" />

            <Button transparent
              onPress={this.searchPlace}>
              <Icon type="Entypo" name="location" />
            </Button>

          </Item>
        </Header>
        <Content>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
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
        </Content>
        {this.state.direction != null &&
          <Footer>
            <FooterTab>
              <Button full>
                <Text>{this.state.direction}</Text>
              </Button>
            </FooterTab>
          </Footer>
        }
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  map: {
    width,
    height,
  }
})

export default App
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
} from '@chakra-ui/react'
import { FaLocationArrow, FaTimes } from 'react-icons/fa'

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { useRef, useState } from 'react'

import pothole from '../src/assets/img/pothole.jpg'

const center = { lat: 19.0522, lng: 72.9005 }
const potholeLocations = [
  { lat: 19.04141, lng: 72.88975 },
  { lat: 19.04287622208201, lng:72.89348475176072 }
  // Add more pothole locations here as needed
];

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDnyb11tWZluAFYBaG8sEVYpu2L6nwIWPE',
    libraries: ['places'],
  })

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [buttonClicked, setButtonClicked] = useState(false);
  const [generatedPoints, setGeneratedPoints] = useState([]);


  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef()

  const numRandomPoints = 5; // Specify the number of random points to generate

  // Function to generate random points between the origin and destination
  function generateRandomPoints(origin, numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const randomLat = origin.lat + Math.random() * 0.02; // Adjust the range as needed
      const randomLng = origin.lng + Math.random() * 0.02; // Adjust the range as needed
      points.push({ lat: randomLat, lng: randomLng });
    }
    return points;
  }

  if (!isLoaded) {
    return <SkeletonText />
  }

  const renderPotholeMarkers = () => {
    return generatedPoints.map((location, index) => (
      <Marker
        key={index}
        position={location}
        icon={{
          url: pothole, // Corrected URL format
          scaledSize: new window.google.maps.Size(30, 30)
        }}
      />
    ));
  };

  async function calculateRoute() {
    if (originRef.current.value === '' || destiantionRef.current.value === '') {
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    console.log(results);
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
    setButtonClicked(true);
    if (results && results.routes[0] && results.routes[0].legs[0] && results.routes[0].legs[0].start_location) {
      const newGeneratedPoints = generateRandomPoints({
        lat: results.routes[0].legs[0].start_location.lat(),
        lng: results.routes[0].legs[0].start_location.lng(),
      }, numRandomPoints);
      setGeneratedPoints(newGeneratedPoints); // Update the state variable
      console.log(newGeneratedPoints);
    }


  }

  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destiantionRef.current.value = ''
    setButtonClicked(false)
  }

  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      h='100vh'
      w='100vw'
    >
      <Box position='absolute' left={0} top={0} h='100%' w='100%'>
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}

          {/* Add pothole markers to the map */}
          {buttonClicked && renderPotholeMarkers()}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius='lg'
        m={4}
        bgColor='white'
        shadow='base'
        minW='container.md'
        zIndex='1'
      >
        <HStack spacing={2} justifyContent='space-between'>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input type='text' placeholder='Origin' ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type='text'
                placeholder='Destination'
                ref={destiantionRef}
              />
            </Autocomplete>
          </Box>

          <ButtonGroup>
            <Button colorScheme='pink' type='submit' onClick={calculateRoute}>
              Calculate Route
            </Button>
            <IconButton
              aria-label='center back'
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent='space-between'>
          <Text>Distance: {distance} </Text>
          <Text>Duration: {duration} </Text>
          <IconButton
            aria-label='center back'
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.panTo(center)
              map.setZoom(15)
            }}
          />
        </HStack>
      </Box>
    </Flex>
  )
}

export default App

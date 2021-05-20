import 'react-native-gesture-handler';

import React from 'react';
import styled from 'styled-components/native';
import { View, Text, Button } from 'react-native';

export default function App({ navigation }) {
    return (
        <Container>
            <Title color="white">Android Admin Application</Title>
            <Title color="chocolate"></Title>
            <Button title="Track My Location" onPress={() => navigation.navigate('Tracking')}></Button>
        </Container>
    );
}

const Container = styled(View)`
  flex: 1;
  background-color: black;
  justify-content: center;
  align-items: center;
`;

const Title = styled(Text)`
  font-size: 24px;
  font-weight: 500;
  color: ${(props) => props.color};
`;

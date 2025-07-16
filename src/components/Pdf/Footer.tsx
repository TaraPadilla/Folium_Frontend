import React from 'react';
import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';


// Fondo amarillo decorativo (solo borde izquierdo)
const backgroundURL = import.meta.env.VITE_IMAGE_URL + '/footer_bg_simple.png';
console.log('backgroundURL', backgroundURL);
const iconPhone = import.meta.env.VITE_IMAGE_URL + '/icons/phone.png';
const iconWeb = import.meta.env.VITE_IMAGE_URL + '/icons/web.png';
const iconEmail = import.meta.env.VITE_IMAGE_URL + '/icons/email.png';
const iconLocation = import.meta.env.VITE_IMAGE_URL + '/icons/location.png';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 595.28, // A4 exacto
    height: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 9,
    color: '#888',
    paddingBottom: 12,
  },
  bg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 595.28,
    height: 80,
    zIndex: -1,
  },
  column: {
    marginHorizontal: 30,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 0,
  },
  icon: {
    width: 10,
    height: 10,
    marginRight: 4,
    marginTop: 2,
  },
});

const Footer: React.FC = () => (
  <View style={styles.container}>
    {/* Fondo amarillo lateral */}
    <Image src={backgroundURL} style={styles.bg} />

    {/* Columna izquierda */}
    <View style={styles.column}>
      <View style={styles.row}>
      <Image src={iconPhone} style={styles.icon} />
        <Text style={{marginTop: 10}}>095556790</Text>
      </View>
      <View style={styles.row}>
      <Image src={iconWeb} style={styles.icon} />
        <Text style={{marginTop: 10}}>www.folium.com.uy</Text>
      </View>
    </View>

    {/* Columna derecha */}
    <View style={styles.column}>
      <View style={styles.row}>
      <Image src={iconEmail} style={styles.icon} />
        <Text style={{marginTop: 10}}>info@folium.com.uy</Text>
      </View>
      <View style={styles.row}>
      <Image src={iconLocation} style={styles.icon} />
        <Text style={{marginTop: 10}}>Montevideo - Maldonado</Text>
      </View>
    </View>
  </View>
);

export default Footer;

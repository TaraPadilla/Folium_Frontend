import { View, Image, StyleSheet } from "@react-pdf/renderer";

const logoURL = 'https://d72.0f3.mytemp.website/images/LogoFolium.jpg';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  arriba: {
    width: 595.28, // ancho exacto de A4
    height: 100,
    marginTop: -25,
    marginLeft: -25,
  },  
  header: {
    width: '100%',
    height: 100,
  },
  logo: {
    width: 120,
    height: 120,
    marginLeft: 350,
  },
});

const Header: React.FC = () => (
    <>
      <View style={styles.arriba}>
        <Image src={`${import.meta.env.VITE_IMAGE_URL}/header_curvo.png`} style={styles.arriba} />
      </View>
      <View style={styles.header}>
        <Image src={logoURL} style={styles.logo} />
      </View>
    </>
  );
  
  export default Header;
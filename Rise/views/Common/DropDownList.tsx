import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import theme from '../../Theme/Theme';

const DropDownList = ({ data, defaultId, onSelection }) => {
  const [selectedId, setSelectedId] = useState(defaultId);
  const [modalVisible, setModalVisible] = useState(false);

  const defaultTitle = data.find((item) => item.id === selectedId)?.title || "";

  const handleSelection = (id) => {
    setSelectedId(id);
    onSelection(id); // Pass the selected id to the parent component
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Rounded Box */}
      <TouchableOpacity
        style={styles.box}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.text}>
          {defaultTitle}
        </Text>
        {/* Ionicons down arrow */}
        <Ionicons name="chevron-down" size={16} color={theme.colors.black} style={styles.arrow} />
      </TouchableOpacity>

      {/* Modal for List */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)} // Dismiss modal on outside touch
        >
          <View style={styles.modalContent}>
            <FlatList
              data={data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelection(item.id)}
                >
                  <Text style={styles.itemText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    backgroundColor: theme.colors.grey3,
    flexDirection: 'row',  // Align text and arrow in a row
    alignItems: 'center',  // Center them vertically
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.black,
    flex: 1,  // Allow text to take available space
  },
  arrow: {
    paddingLeft: 5,  // Space between text and arrow
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey1,
  },
  itemText: {
    fontSize: 16,
    color: theme.colors.black,
  },
});

export default DropDownList;

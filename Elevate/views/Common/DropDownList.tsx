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
import { AnalyticsHelper, ActionType } from '../../Analytics/AnalyticsHelper';

const DropDownList = ({ source, data, defaultId, onSelection }) => {
  const [selectedId, setSelectedId] = useState(defaultId);
  const [modalVisible, setModalVisible] = useState(false);

  const defaultTitle = data.find((item) => item.id === selectedId)?.title || "";

  const showDropDown = () => {
    setModalVisible(true)
    sendCategoryFilterAppeardEvent()
  }
  const handleSelection = (id) => {
    setSelectedId(id);
    onSelection(id); // Pass the selected id to the parent component
    setModalVisible(false);
  };

  const sendCategoryFilterAppeardEvent = async () => {
    let evendId = ''
    let screenName = ''
    let eventName = ''
    let subSsectionName = ''

    if (source == 'Save_Category') {
      evendId  = '2.2.0'
      screenName = 'Save'
      eventName = 'Category_Filter_Appear'
      subSsectionName = 'Category_Filter'

    } else if (source == 'Task_Category') {
      evendId  = '3.2.0'
      screenName = 'Task'
      eventName = 'Category_Filter_Appear'
      subSsectionName = 'Category_Filter'
    }


    await AnalyticsHelper.sendEvent(
      evendId,
      eventName,
      screenName,
      subSsectionName,
      ActionType.IMPRESSION,
      '',
      {}
    );
  };

  return (
    <View style={styles.container}>
      {/* Rounded Box */}
      <TouchableOpacity
        style={styles.box}
        onPress={() => showDropDown()}
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.grey3,
    flexDirection: 'row',  
    alignItems: 'center', 
    width: 'auto', 
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.black,
    flexShrink: 1, 
  },
  arrow: {
    paddingLeft: 5,  
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey2, 
  },
  itemText: {
    fontSize: 16,
    color: theme.colors.black,
  },
});

export default DropDownList;

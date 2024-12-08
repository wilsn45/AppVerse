import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../../Theme/Theme';
import { AnalyticsHelper, ActionType } from '../../Analytics/AnalyticsHelper';

const DropDownList = ({ source, data, defaultId, onSelection }) => {
  const [selectedId, setSelectedId] = useState(defaultId);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalFocusRef, setModalFocusRef] = useState(null);

  const defaultTitle = data.find((item) => item.id === selectedId)?.title || "";

  const showDropDown = () => {
    setModalVisible(true);
    sendCategoryFilterAppeardEvent();
  };

  const handleSelection = (id) => {
    setSelectedId(id);
    onSelection(id); // Pass the selected id to the parent component
    setModalVisible(false);
  };

  const sendCategoryFilterAppeardEvent = async () => {
    let eventId = '';
    let screenName = '';
    let eventName = '';
    let subSectionName = '';

    if (source === 'Save_Category') {
      eventId = '2.2.0';
      screenName = 'Save';
      eventName = 'Category_Filter_Appear';
      subSectionName = 'Category_Filter';
    } else if (source === 'Task_Category') {
      eventId = '3.2.0';
      screenName = 'Task';
      eventName = 'Category_Filter_Appear';
      subSectionName = 'Category_Filter';
    }

    await AnalyticsHelper.sendEvent(
      eventId,
      eventName,
      screenName,
      subSectionName,
      ActionType.IMPRESSION,
      '',
      {}
    );
  };

  useEffect(() => {
    if (modalVisible && modalFocusRef) {
      // Set focus to the modal
      const focusHandle = findNodeHandle(modalFocusRef);
      AccessibilityInfo.setAccessibilityFocus(focusHandle);
    }
  }, [modalVisible, modalFocusRef]);

  return (
    <View style={styles.container}>
      {/* Dropdown Button */}
      <TouchableOpacity
        style={styles.box}
        onPress={() => showDropDown()}
        accessibilityLabel={`Open dropdown to select category. Current selection: ${defaultTitle}`}
        accessibilityRole="button"
      >
        <Text style={styles.text}>{defaultTitle}</Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={theme.colors.black}
          style={styles.arrow}
          accessibilityLabel="Dropdown icon"
        />
      </TouchableOpacity>

      {/* Modal for Dropdown List */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        accessibilityViewIsModal={true}
        accessibilityLabel="Category selection modal"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          accessibilityLabel="Close dropdown by tapping outside"
          accessibilityRole="button"
        >
          <View
            style={styles.modalContent}
            ref={setModalFocusRef}
            accessibilityRole="dialog"
            accessibilityLabel="Select a category from the list"
          >
            <FlatList
              data={data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelection(item.id)}
                  accessibilityLabel={`Select ${item.title}`}
                  accessibilityRole="button"
                >
                  <Text style={styles.itemText}>{item.title}</Text>
                </TouchableOpacity>
              )}
              accessibilityLabel="List of categories"
              accessibilityRole="list"
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    borderWidth: 1,
    borderColor: '#ccc',
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
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
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

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {curioTheme} from '../../theme';

export type CurioTab =
  | 'home'
  | 'curio'
  | 'saved'
  | 'profile';

type Props = {
  selected: CurioTab;
  onSelect: (tab: CurioTab) => void;
};

export const BottomTabBar = ({
  selected,
  onSelect,
}: Props) => {
  const normalTabs: {
    id: CurioTab;
    label: string;
    icon: string;
    active: string;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home-outline',
      active: 'home',
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: 'bookmark-outline',
      active: 'bookmark',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      active: 'person',
    },
  ];

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.item}
        onPress={() => onSelect('curio')}>
        <View
          style={[
            styles.curioIcon,
            selected === 'curio' &&
              styles.curioIconActive,
          ]}>
          <Text
            style={[
              styles.curioC,
              {
                color:
                  selected === 'curio'
                    ? curioTheme.colors.white
                    : curioTheme.colors.primary,
              },
            ]}>
            C
          </Text>
        </View>

        <Text
          style={[
            styles.label,
            selected === 'curio' &&
              styles.active,
          ]}>
          Curio
        </Text>
      </Pressable>

      <Tab
        tab={normalTabs[0]}
        active={selected === 'home'}
        onPress={() => onSelect('home')}
      />

      <Tab
        tab={normalTabs[1]}
        active={selected === 'saved'}
        onPress={() => onSelect('saved')}
      />

      <Tab
        tab={normalTabs[2]}
        active={selected === 'profile'}
        onPress={() => onSelect('profile')}
      />
    </View>
  );
};

const Tab = ({
  tab,
  active,
  onPress,
}: {
  tab: {
    id: CurioTab;
    label: string;
    icon: string;
    active: string;
  };
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    style={styles.item}
    onPress={onPress}>
    <Icon
      name={active ? tab.active : tab.icon}
      size={22}
      color={
        active
          ? curioTheme.colors.primary
          : curioTheme.colors.muted
      }
    />

    <Text style={[styles.label, active && styles.active]}>
      {tab.label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: curioTheme.colors.border,
    paddingTop: 4,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  label: {
    fontFamily: 'Roboto-Medium',
    fontSize: 10,
    color: curioTheme.colors.muted,
  },

  active: {
    color: curioTheme.colors.primary,
  },

  curioIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: curioTheme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '-7deg'}],
  },

  curioIconActive: {
    backgroundColor: curioTheme.colors.primary,
    transform: [
      {rotate: '-7deg'},
      {scale: 1.08},
    ],
  },

  curioC: {
    fontFamily: 'Roboto-Black',
    fontSize: 21,
    lineHeight: 24,
    color: '#FFFFFF',
  },
});

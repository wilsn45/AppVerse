import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';
import {CurioCard} from '../components/CurioCard';
import {ContentItem} from '../types/content';
import {FeedService} from '../services/FeedService';
import {CurioStorage} from '../services/CurioStorage';
import {CurioAnalytics} from '../services/CurioAnalytics';
import {curioTheme} from '../theme';

const BATCH_SIZE = 30;
const PREFETCH_DISTANCE = 6;

interface Props {
  interests: string[];
}

export const FeedScreen = ({interests}: Props) => {
  const {height} = useWindowDimensions();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [cursor, setCursor] = useState<string>();
  const seenIds = useRef<string[]>([]);
  const itemIds = useRef(new Set<string>());

  const loadFeed = useCallback(async (append: boolean) => {
    if (append && loadingMore) { return; }
    append ? setLoadingMore(true) : setLoading(true);
    setError(false);
    try {
      const response = await FeedService.getFeed({
        interests,
        seenContentIds: seenIds.current,
        limit: BATCH_SIZE,
        cursor: append ? cursor : undefined,
      });
      const freshItems = response.items.filter(item => !itemIds.current.has(item.id));
      freshItems.forEach(item => itemIds.current.add(item.id));
      setItems(current => append ? [...current, ...freshItems] : freshItems);
      setCursor(response.cursor);
      CurioAnalytics.feedLoaded(freshItems.length, response.cursor ? 'remote' : 'starter');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor, interests, loadingMore]);

  useEffect(() => {
    CurioStorage.getSeenIds().then(ids => { seenIds.current = ids; }).finally(() => loadFeed(false));
    // Initial fetch should only run when the preference set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interests.join(',')]);

  const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: ViewToken[]}) => {
    const visible = viewableItems.find(token => token.isViewable)?.item as ContentItem | undefined;
    if (!visible || seenIds.current.includes(visible.id)) { return; }
    seenIds.current = [visible.id, ...seenIds.current].slice(0, 500);
    CurioStorage.addSeenId(visible.id);
    CurioAnalytics.contentViewed(visible.id, visible.topic, visible.format);
  }).current;

  const onEndReached = () => {
    if (items.length > 0) { loadFeed(true); }
  };

  const renderItem = ({item}: ListRenderItemInfo<ContentItem>) => (
    <CurioCard item={item} height={height} />
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.logo}><Text style={styles.logoText}>C</Text></View>
        <Text style={styles.loadingTitle}>Finding interesting things…</Text>
        <ActivityIndicator color={curioTheme.colors.purple} style={styles.spinner} />
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorEmoji}>🛸</Text>
        <Text style={styles.loadingTitle}>Curiosity hit a speed bump.</Text>
        <TouchableOpacity onPress={() => loadFeed(false)} style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      decelerationRate="fast"
      initialNumToRender={3}
      maxToRenderPerBatch={4}
      windowSize={5}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{itemVisiblePercentThreshold: 65, minimumViewTime: 700}}
      onEndReached={onEndReached}
      onEndReachedThreshold={PREFETCH_DISTANCE / Math.max(items.length, 1)}
      getItemLayout={(_, index) => ({length: height, offset: height * index, index})}
      style={styles.feed}
    />
  );
};

const styles = StyleSheet.create({
  feed: {flex: 1, backgroundColor: curioTheme.colors.white},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: curioTheme.colors.canvas},
  logo: {width: 68, height: 68, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: curioTheme.colors.purple, transform: [{rotate: '-7deg'}]},
  logoText: {fontFamily: 'Roboto-Black', fontSize: 42, color: '#FFFFFF'},
  loadingTitle: {fontFamily: 'Roboto-Black', fontSize: 23, color: curioTheme.colors.ink, textAlign: 'center', marginTop: 24},
  spinner: {marginTop: 22},
  errorEmoji: {fontSize: 60},
  retry: {backgroundColor: curioTheme.colors.ink, borderRadius: 18, paddingHorizontal: 25, paddingVertical: 15, marginTop: 22},
  retryText: {fontFamily: 'Roboto-Bold', fontSize: 16, color: '#FFFFFF'},
});

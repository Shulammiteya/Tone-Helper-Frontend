import React from 'react';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, Layout, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { ImageOverlay } from './image-overlay.component';
import { Theming } from '../../services/theme.service';
import { SafeAreaLayout } from '../../components/safe-area-layout.component';
import { ArrowIosBackIcon } from '../../components/icons';
import { ThemeContext } from 'react-native-elements';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

export default GuidanceScreen = ({navigation}) => {

  const themeContext = React.useContext(Theming.ThemeContext);
  const languageContext = React.useContext(Theming.LanguageContext);

  const renderGoBackAction = () => (
    <TopNavigationAction
      icon={ArrowIosBackIcon}
      onPress={navigation.goBack}
    />
  );

  const renderTitle = () => (
    <Text
      style={styles.title}
      category='h6'>
      {languageContext.isChinese()? '百萬調音師 - 指南' : 'Tone Helper - Guidance'}
    </Text>
  );

  return (
    <SafeAreaLayout style={styles.safeArea} insets='top'>
      <TopNavigation
        accessoryLeft={renderGoBackAction}
        alignment='center'
      />
      <ScrollView style={styles.container}>
        <ImageOverlay
          style={styles.image}
          source={require('../../../assets/image-background.png')}
        />
        <Layout level='3'>
          <Card
            style={styles.bookingCard}
            appearance='filled'
            disabled={true}
            header={renderTitle}
          >
            <Text
              style={[styles.stepLabel, {marginTop: DEVICE_HEIGHT / 50}]}
              category='h6'>
              {languageContext.isChinese()? '錄音' : 'Record'}
            </Text>
            <Text
              style={themeContext.isDarkMode()? styles.stepDiscriptionDarkMode : styles.stepDiscription}
              appearance='hint'
              category='p2'>
              {
                languageContext.isChinese()
                ? '於「創作」頁面，以足夠音量錄製單句或數句咬字清晰的歌詞即可'
                : 'On the "Compositions" page, record a single or several lyrics with sufficient volume.\n( Please speak clearly )'
              }
            </Text>
            <Text
              style={styles.stepLabel}
              category='h6'>
              {languageContext.isChinese()? '調音' : 'Tune'}
            </Text>
            <Text
              style={themeContext.isDarkMode()? styles.stepDiscriptionDarkMode : styles.stepDiscription}
              appearance='hint'
              category='p2'>
              {
                languageContext.isChinese()
                ? '錄音後，右滑即可查看錄製列表，按下項目的右側箭頭即可開始調整該段錄音，\n滑動音符至理想音高後，按下勾選按鈕即可完成\n( 請保持網路連線暢通 )'
                : 'After recording, swipe right to view the recording list, and press the arrow symbol on the right side of the item to start tuning.\nAfter sliding notes to the desired pitch, press the check button to complete.\n( Please keep the internet connection open )'
              }
            </Text>
            <Text
              style={styles.stepLabel}
              category='h6'>
              {languageContext.isChinese()? '匯出' : 'Export'}
            </Text>
            <Text
              style={themeContext.isDarkMode()? styles.stepDiscriptionDarkMode : styles.stepDiscription}
              appearance='hint'
              category='p2'>
              {
                languageContext.isChinese()
                ? '在錄製列表選取項目並按下匯出按鈕，輸入有效名稱後即按時序匯出一首完整歌曲至「曲庫」'
                : 'Select items in the recording list, press the export button, and then enter a valid name to export a complete song in chronological order.\nYou can view all the exported songs on the "Repertoire" page.'
              }
            </Text>
            <Text
              style={styles.stepLabel}
              category='h6'>
              {languageContext.isChinese()? '分享' : 'Share'}
            </Text>
            <Text
              style={themeContext.isDarkMode()? styles.stepDiscriptionDarkMode : styles.stepDiscription}
              appearance='hint'
              category='p2'>
              {
                languageContext.isChinese()
                ? '於「曲庫」頁面，選擇歌曲右滑後即可分享給朋友！'
                : 'On the "Repertoire" page, select a song and swipe right to share it with your friends！'
              }
            </Text>
          </Card>
          <Text
            style={styles.aboutLabel}
            category='s1'>
            {languageContext.isChinese()? '關於' : 'About'}
          </Text>
          <Text
            style={themeContext.isDarkMode()? styles.aboutDescriptionDarkMode : styles.aboutDescription}
            appearance='hint'>
            {
              languageContext.isChinese()
              ? '基於語音合成技術之iOS與Android作業系統的手機調音應用程式'
              : 'A mobile tuning application for iOS and Android operating systems based on speech syhthesis technology.'
            }
          </Text>
        </Layout>
      </ScrollView>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  image: {
    height: 200,
  },
  bookingCard: {
    marginTop: -60,
    margin: DEVICE_WIDTH / 20,
  },
  title: {
    textAlign: 'center',
    marginVertical: DEVICE_HEIGHT / 20,
  },
  stepLabel: {
    marginTop: DEVICE_HEIGHT / 24,
  },
  stepDiscription: {
    marginTop: DEVICE_HEIGHT / 60,
    color: '#5F6B83'
  },
  stepDiscriptionDarkMode: {
    marginTop: DEVICE_HEIGHT / 60,
  },
  aboutLabel: {
    marginHorizontal: DEVICE_WIDTH / 10,
    marginVertical: DEVICE_HEIGHT / 50,
  },
  aboutDescription: {
    marginHorizontal: DEVICE_WIDTH / 10,
    marginBottom: DEVICE_HEIGHT / 12,
    color: '#5F6B83'
  },
  aboutDescriptionDarkMode: {
    marginHorizontal: DEVICE_WIDTH / 10,
    marginBottom: DEVICE_HEIGHT / 12,
  },
});

import React from 'react';
import { Linking,FlatList,ScrollView,ActivityIndicator,StyleSheet, Text, View } from 'react-native';
import moment from 'moment';
import { Icon,Card, Button } from 'react-native-elements';
import {filterForUniqueArticles} from './utils';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state={
      loading:true,
      articles:[],
      pageNumber:1,
      hasErrored:false,
      lastPageReached:false,
    }
  }
  getNews = async () => {
    await this.setState({loading:true});
    if (this.state.lastPageReached) return;
    const response = await fetch(
      'https://newsapi.org/v2/top-headlines?country=us&apiKey=7448137144794398ab943714f8d679b0'
    );
    const jsonData = await response.json();
    const hasMoreArticles = jsonData.articles.length > 0;
    if (hasMoreArticles) {
      const newArticleList = filterForUniqueArticles(jsonData.articles);
      await this.setState({
        articles:newArticleList,
        pageNumber:this.state.pageNumber+1,
        loading:false,
      });
    } else {
      await this.setState({
        lastPageReached:true
      });
    }
  };
  componentDidMount(){
    this.getNews();
  }
  componentDidUpdate(prevProps,prevState){
    if (JSON.stringify(prevState.articles)!=JSON.stringify(this.state.articles)) {
      this.getNews();
    }
  }
  renderArticleItem = ({ item }) => {
    return (
      <Card title={item.title} image={{uri:item.urlToImage}}>
        <View style={styles.row}>
          <Text style={styles.label}>Source</Text>
          <Text style={styles.info}>{item.source.name}</Text>
        </View>
        <Text>{item.content}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Published</Text>
          <Text style={styles.info}>
            {moment(item.publishedAt).format('LLL')}
          </Text>
        </View>
        <Button onPress={() => this.onPress(item.url)} icon={<Icon />} title="Read more" backgroundColor="#03A9F4" />
      </Card>
    );
  };
  onPress = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
      }
    });
  };
  render(){
    if (this.state.hasErrored) {
      return (
        <View style={styles.container}>
          <Text>Error =(</Text>
        </View>
      );
    }
    if (this.state.loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" loading={this.state.loading} />
        </View>
      );
    }
    return (
      <View>
        <View style={[styles.row,styles.title]}>
          <Text style={styles.label}>Articles Count:</Text>
          <Text style={styles.info}>{this.state.articles.length}</Text>
        </View>
        <FlatList
          data={this.state.articles}
          renderItem={this.renderArticleItem}
          keyExtractor={item => item.title}
          onEndReached={this.state.getNews} 
          onEndReachedThreshold={1}
          ListFooterComponent={this.state.lastPageReached ? <Text>No more articles</Text> : <ActivityIndicator
                size="large"
                loading={this.state.loading}
        />}
        />
      </View>
      
    );
  }
}

const styles = StyleSheet.create({
  title:{
    paddingTop:30,
    justifyContent:'center'
  },
  containerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  header: {
    height: 30,
    width: '100%',
    backgroundColor: 'pink'
  },
  row: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginRight: 10,
    fontWeight: 'bold'
  },
  info: {
    fontSize: 16,
    color: 'grey'
  }
});

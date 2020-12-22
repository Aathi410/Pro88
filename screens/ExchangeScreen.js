import * as React from 'react';
import {View,Text,TouchableOpacity,StyleSheet,TextInput,KeyboardAvoidingView,Alert} from 'react-native';
import MyHeader from '../components/MyHeader';
import db from '../config';
import firebase from 'firebase';

export default class BookRequestScreen extends React.Component{
    constructor(){
        super();
        this.state={
            userId : firebase.auth().currentUser.email,
            itemName:'',
            description:'',
            IsBookRequestActive:'',
            requestedItemName:'',
            itemStatus:'',
            exchangeId:'',
            userDocId:'',
            docId:'',
            itemValue:"",
            currencyCode:""

        }
    }

    createUniqueId(){
        return Math.random().toString(36).substring(7)
    }

    addItem = async (itemName,description)=>{
        var userId = this.state.userId
        var exchangeId = this.createUniqueId();
        db.collection('exchange_requests').add({
            'user_name':userId,
            'item_name':itemName,
            'description':description,
            "exchangeId"  : exchangeId,
            "item_status" : "requested",
            "item_value"  : this.state.itemValue,
            "date"       : firebase.firestore.FieldValue.serverTimestamp()
        })
        await this.getExchangeRequest()
        db.collection('users').where("user_name","==",userId).get()
        .then()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                db.collection('users').doc(doc.id).update({
                    IsExchangeRequestActive: true
                })
            })
        })

        this.setState({
            itemName:'',
            description:'',
            itemValue : ""
        })

        return Alert.alert(
            'Item Ready To Exchange',
            '',
            [
                {text: 'OK', onPress: () => {
                    this.props.navigation.navigate('BarterList')
                }}
            ]
        );
    }

    receivedItem=(itemName)=>{
        var userId = this.state.userId
        var exchangeId = this.state.exchangeId
        db.collection('received_items').add({
            "user_name": userId,
            "item_name":itemName,
            "exchange_id"  : exchangeId,
            "itemStatus"  : "received",
    
        })
    }

    getIsExchangeRequestActive(){
        db.collection('users')
        .where('user_name','==',this.state.userId)
        .onSnapshot(querySnapshot => {
          querySnapshot.forEach(doc => {
            this.setState({
              IsExchangeRequestActive:doc.data().IsExchangeRequestActive,
              userDocId : doc.id,
              currencyCode: doc.data().currency_code
            })
          })
        })
      }
    
    getExchangeRequest =()=>{
        var exchangeRequest =  db.collection('exchange_requests')
        .where('user_name','==',this.state.userId).get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                if(doc.data().item_status !== "received"){
                    this.setState({
                        exchangeId : doc.data().exchangeId,
                        requestedItemName: doc.data().item_name,
                        itemStatus:doc.data().item_status,
                        docId     : doc.id,
                        itemValue : doc.data().item_value,
                    })
                }
          })
        })
    }
    
    sendNotification=()=>{
        db.collection('users').where('user_name','==',this.state.userId).get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                var name = doc.data().first_name
                var lastName = doc.data().last_name
                db.collection('all_notifications').where('exchange_Id','==',this.state.exchangeId).get()
                .then((snapshot)=>{
                    snapshot.forEach((doc) => {
                        var donorId  = doc.data().donor_id
                        var itemName =  doc.data().item_name
                        db.collection('all_notifications').add({
                            targeted_user_id : donorId,
                            message : name +" " + lastName + " received the item " + itemName ,
                            notification_status : "unread",
                            item_name : itemName
                        })
                    })
                })
            })
        })
    }


    getData(){
        fetch("http://data.fixer.io/api/latest?access_key=1f7dd48123a05ae588283b5e13fae944&format=1")
        .then(response=>{
          return response.json();
        }).then(responseData =>{
          var currencyCode = this.state.currencyCode
          var currency = responseData.rates.INR
          var value =  69 / currency
          console.log(value);
        })
        }
    
    componentDidMount(){
        this.getExchangeRequest()
        this.getIsExchangeRequestActive()
        this.getData()
    }
    
    updateExchangeRequestStatus=()=>{
        db.collection('exchange_requests').doc(this.state.docId).update({
            item_status : 'recieved',
        })
        db.collection('users').where('user_name','==',this.state.userId).get()
        .then((snapshot)=>{
            snapshot.forEach((doc) => {
                db.collection('users').doc(doc.id).update({
                IsExchangeRequestActive: false
                })
            })
        })
    
    }
    
    render(){
        if (this.state.IsExchangeRequestActive === true){
            return(
                <View style = {{flex:1,justifyContent:'center'}}>
                    <View style={{borderColor:"orange", borderWidth:2, justifyContent:'center',
                            alignItems:'center', padding:10, margin:10}}>
                        <Text>Item Name</Text>
                        <Text>{this.state.requestedItemName}</Text>
                    </View>
                    <View style={{borderColor:"orange", borderWidth:2, justifyContent:'center', 
                            alignItems:'center', padding:10, margin:10}}>
                        <Text> Item Value </Text>
                        <Text>{this.state.itemValue}</Text>
                    </View>
                    <View style={{borderColor:"orange", borderWidth:2, justifyContent:'center',
                            alignItems:'center', padding:10, margin:10}}>
                        <Text> Item Status </Text>
                        <Text>{this.state.itemStatus}</Text>
                    </View>
            
                    <TouchableOpacity style={{borderWidth:1, borderColor:'orange', backgroundColor:"orange",
                                        width:300, alignSelf:'center', alignItems:'center', height:30, marginTop:30}}
                        onPress={()=>{
                            this.sendNotification()
                            this.updateExchangeRequestStatus();
                            this.receivedItem(this.state.requestedItemName)
                        }}>
                        <Text>I recieved the Item </Text>
                    </TouchableOpacity>
                </View>
            )
        }
        else{
            return(
                <View style={{flex:1}}>
                    <MyHeader title = "Add Item"/>
                    <KeyboardAvoidingView style={styles.keyBoardStyle}>
                        <TextInput
                            style={styles.formTextInput}
                            placeholder='Item Name'
                            onChangeText={(text)=>{
                                this.setState({itemName:text})
                            }}
                            value = {this.state.itemName}
                        />

                        <TextInput
                            style={[styles.formTextInput,{height:300,}]}
                            multiline
                            numberOfLines = {8} 
                            placeholder='Descripition'
                            onChangeText={(text)=>{
                                this.setState({description:text})
                            }}
                            value = {this.state.description}
                        />

                        <TextInput
                            style={styles.formTextInput}
                            placeholder ={"Item Value"}
                            maxLength ={8}
                            onChangeText={(text)=>{
                                this.setState({
                                    itemValue: text
                                })
                            }}
                            value={this.state.itemValue}
                        />

                        <TouchableOpacity 
                            style={styles.button}
                            onPress={()=>{
                                this.addItem(this.state.itemName,this.state.description,this.state.itemValue)
                            }}>
                            <Text style={{color: '#ffff', fontSize:18, fontWeight:"bold"}}>Add Item</Text>
                        </TouchableOpacity>   
                    </KeyboardAvoidingView>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    keyBoardStyle : {
      flex:1,
      alignItems:'center',
      justifyContent:'center'
    },
    formTextInput:{
      width:"75%",
      height:35,
      alignSelf:'center',
      borderColor:'#ffab91',
      borderRadius:10,
      borderWidth:1,
      marginTop:20,
      padding:10,
    },
    button:{
      width:"75%",
      height:50,
      justifyContent:'center',
      alignItems:'center',
      borderRadius:10,
      backgroundColor:"#ff5722",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 8,
      },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      elevation: 16,
      marginTop:20
      },
    }
  )
import * as React from 'react';
import {Text,View,TouchableOpacity, StyleSheet, Alert, TextInput,
Modal, ScrollView, KeyboardAvoidingView} from 'react-native';
import db from '../config';
import firebase from 'firebase';

export default class SignUpAndLoginScreen extends React.Component{
    constructor(){
        super();
        this.state={
            username:'',
            password:'',
            isModalVisible:false,
            firstName:'',
            lastName:'',
            address:'',
            contact:'',
            confirmPassword:'',
            currencyCode:""
        }
    }
    
    userLogin = (username,password) => {
        firebase.auth().signInWithEmailAndPassword(username,password)
        .then((Response)=>{
          this.props.navigation.navigate('Home')
        })
        .catch((error)=>{
          var errorCode = error.code
          var errorMessage = error.message
          return Alert.alert(errorMessage)
        })
      }

      userSignUp=(username,password,confirmPassword)=>{
        if(password !== confirmPassword){
          return Alert.alert("Password Do Not Match \n Check Your Password.")
        }
        else{
          firebase.auth().createUserWithEmailAndPassword(username, password)
            .then((response)=>{
              db.collection('users').add({
                first_name:this.state.firstName,
                last_name:this.state.lastName,
                contact:this.state.contact,
                user_name:this.state.username,
                address:this.state.address,
                IsItemRequestActive:false,
                currency_code:this.state.currencyCode
              })
              return  Alert.alert(
                    'User Added Successfully',
                    '',
                    [
                      {text: 'OK', onPress: () => this.setState({"isModalVisible" : false})},
                    ]
                );
            })
          .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            return Alert.alert(errorMessage)
          });
        }
      }

    showModal=()=>{
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.isModalVisible}
          >
          <View style={styles.modalContainer}>
            <ScrollView style={{width:'100%'}}>
              <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
                  <Text
                    style={styles.modalTitle}
                    >Registration</Text>
                  <TextInput
                    style={styles.formTextInput}
                    placeholder ={"First Name"}
                    maxLength ={8}
                    onChangeText={(text)=>{
                      this.setState({
                        firstName: text
                      })
                    }}
                  />
                  <TextInput
                    style={styles.formTextInput}
                    placeholder ={"Last Name"}
                    maxLength ={8}
                    onChangeText={(text)=>{
                      this.setState({
                        lastName: text
                      })
                    }}
                  />
                  <TextInput
                    style={styles.formTextInput}
                    placeholder ={"Contact"}
                    maxLength ={10}
                    keyboardType={'numeric'}
                    onChangeText={(text)=>{
                      this.setState({
                        contact: text
                      })
                    }}
                  />
                  <TextInput
                    style={styles.formTextInput}
                    placeholder ={"Address"}
                    multiline = {true}
                    onChangeText={(text)=>{
                      this.setState({
                        address: text
                      })
                    }}
                  />
                  <TextInput
                    style={styles.formTextInput}
                    placeholder ={"Email"}
                    keyboardType ={'email-address'}
                    onChangeText={(text)=>{
                      this.setState({
                        username: text
                      })
                    }}
                  /><TextInput
                      style={styles.formTextInput}
                      placeholder ={"Password"}
                      secureTextEntry = {true}
                      onChangeText={(text)=>{
                        this.setState({
                          password: text
                        })
                      }}
                  /><TextInput
                      style={styles.formTextInput}
                      placeholder ={"Confrim Password"}
                      secureTextEntry = {true}
                      onChangeText={(text)=>{
                        this.setState({
                          confirmPassword: text
                        })
                      }}
                  />
                    <TextInput
                      style={styles.formTextInput}
                      placeholder ={"Country Currency Code"}
                      maxLength ={8}
                      onChangeText={(text)=>{
                        this.setState({
                        currencyCode: text
                        })
                      }}
                    />
                  <View style={styles.modalBackButton}>
                    <TouchableOpacity
                      style={styles.registerButton}
                      onPress={()=>
                        this.userSignUp(this.state.username, this.state.password, this.state.confirmPassword)
                      }
                    >
                    <Text style={styles.registerButtonText}>Register</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modalBackButton}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={()=>this.setState({'isModalVisible':false})}
                    >
                    <Text style={{color:'#ff5722'}}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
              </KeyboardAvoidingView>
            </ScrollView>
          </View>
        </Modal>
      );
    }    

    render(){
        return(
            <View style={styles.container}>

                {
                  this.showModal()
                }
                <Text style={styles.title}>Barter App</Text>
            
                <View style={styles.profileContainer}>
                    <Text style={{color:'#ff5722', fontSize:19, fontWeight:'bold', marginRight:213,}}>UserName</Text>    
                    <TextInput
                        style={styles.loginBox}
                        keyboardType="email-address"
                        onChangeText={(text)=>{
                            this.setState({
                                username:text,
                            })
                        }}
                    />

                    <Text style={{marginTop:20,color:'#ff5722', fontSize:19, fontWeight:'bold', marginRight:215,}}>Password</Text>
                    <TextInput
                        style={styles.loginBox}
                        secureTextEntry={true}
                        onChangeText={(text)=>{
                            this.setState({
                                password:text,
                            })
                        }}
                    />

                    <TouchableOpacity
                      style={[styles.button,{marginBottom:20,marginTop:20}]}
                      onPress={()=>{
                        this.userLogin(this.state.username,this.state.password)
                      }}>
                      <Text style={styles.buttonText}>Login</Text>  
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={()=>{
                        this.setState({isModalVisible:true})
                      }}>
                      <Text style={styles.buttonText}>Sign Up</Text>  
                    </TouchableOpacity>                                           
                </View>
                
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container:{
      flex:1,
      backgroundColor:'#F8BE85'
    },
    profileContainer:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
    },
    title :{
      marginTop:30,
      alignSelf:'center',
      fontSize:65,
      fontWeight:'bold',
      paddingBottom:30,
      color : '#ff3d00'
    },
    loginBox:{
      width: 300,
      height: 40,
      borderBottomWidth: 3,
      borderColor : '#000000',
      fontSize: 20,
      margin:10,
      paddingLeft:10
    },
    button:{
      width:300,
      height:50,
      justifyContent:'center',
      alignItems:'center',
      borderRadius:25,
      backgroundColor:"#ff9800",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 8,
      },
      shadowOpacity: 0.30,
      shadowRadius: 10.32,
      elevation: 16,
    },
    buttonText:{
      color:'#ffff',
      fontWeight:'200',
      fontSize:20
    },
    buttonContainer:{
      flex:1,
      alignItems:'center'
    },
    KeyboardAvoidingView:{
      flex:1,
      justifyContent:'center',
      alignItems:'center'
    },
    modalTitle :{
      justifyContent:'center',
      alignSelf:'center',
      fontSize:30,
      color:'#ff5722',
      margin:50
    },
    modalContainer:{
      flex:1,
      borderRadius:20,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:"#ffff",
      marginRight:30,
      marginLeft : 30,
      marginTop:80,
      marginBottom:80,
    },
    formTextInput:{
      width:"75%",
      height:35,
      alignSelf:'center',
      borderColor:'#ffab91',
      borderRadius:10,
      borderWidth:1,
      marginTop:20,
      padding:10
    },
    registerButton:{
      width:200,
      height:40,
      alignItems:'center',
      justifyContent:'center',
      borderWidth:1,
      borderRadius:10,
      marginTop:30
    },
    registerButtonText:{
      color:'#ff5722',
      fontSize:15,
      fontWeight:'bold'
    },
    cancelButton:{
      width:200,
      height:30,
      justifyContent:'center',
      alignItems:'center',
      marginTop:5,
    },
  })
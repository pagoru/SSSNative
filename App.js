import 'expo';
import React from 'react';
import { Text, View, Image, TextInput, Keyboard, Animated, KeyboardAvoidingView, Clipboard, StatusBar, AsyncStorage } from 'react-native';
import { getPassword, getHash } from 'super-secret-settings';
import * as base64 from 'base-64';

function getShortHash(text, len = 8) {
    return getHash(text).substring(0, len);
}

export default class App extends React.Component {

    static DataStoreStrings = [
        '@SSSNative:password',
        '@SSSNative:service'
    ];

    state = {
        backgroundColorIndex: 0,
        backgroundColor: '#000',
        password: '',
        service: '',
        image: { uri: 'https://avatars3.githubusercontent.com/u/12001866?s=480' }
    };

    constructor(props) {
        super(props);
        this.paddingInput = new Animated.Value(0);

        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeService = this.onChangeService.bind(this);
    }

    async componentWillMount() {
        this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);

        try {
            const password = await AsyncStorage.getItem(App.DataStoreStrings[0]);
            const service = await AsyncStorage.getItem(App.DataStoreStrings[1]);
            console.log(password + "-" + service);
            this.setState({
                password: password !== null ? base64.decode(password) : '',
                service: service !== null ? base64.decode(service) : ''
            });
        } catch (error) {
            console.error(error);
        }
    }

    keyboardWillShow = (event) => {
        Animated.timing(this.paddingInput, {
            duration: event.duration,
            toValue: 60,
        }).start();
    };

    keyboardWillHide = (event) => {
        Animated.timing(this.paddingInput, {
            duration: event.duration,
            toValue: 0,
        }).start();
    };

    async onChangePassword(password){
        this.setState({ password });
        try {
            await AsyncStorage.setItem('@SSSNative:password', base64.encode(password));
        } catch (error) {
            console.error(error);
        }
    }

    async onChangeService(service){
        this.setState({ service });
        try {
            await AsyncStorage.setItem('@SSSNative:service', base64.encode(service));
        } catch (error) {
            console.error(error);
        }
    }

    onSubmit(){
        Clipboard.setString(this.getServicePassword());
    }

    getServicePassword(){
        return getPassword(this.state.password, this.state.service);
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <StatusBar hidden={true}/>
                <View style={{
                    flex: 6,
                    backgroundColor: `#${getShortHash(this.state.password, 6)}`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    }}>
                    <Image source={this.state.image} style={{width: 160, height: 160}}/>
                    <Text style={{ color: '#fff' }}>{getShortHash(this.state.password)}</Text>
                </View>
                <KeyboardAvoidingView behavior='padding' style={{ flex: 1.5, backgroundColor: '#000' }}>
                    <Animated.View style={{ marginBottom: this.paddingInput }}>
                        <TextInput
                            secureTextEntry={true}
                            placeholder='password'
                            style={{
                                color: '#fff',
                                height: 40,
                                marginHorizontal: 8
                            }}
                            underlineColorAndroid='transparent'
                            onChangeText={this.onChangePassword}
                            value={this.state.password}
                            onEndEditing={_ => this.onSubmit()}
                        />
                        <TextInput
                            placeholder='service'
                            style={{
                                color: '#fff',
                                height: 40,
                                marginHorizontal: 8
                            }}
                            underlineColorAndroid='transparent'
                            onChangeText={this.onChangeService}
                            value={this.state.service}
                            onEndEditing={_ => this.onSubmit()}
                        />
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        );
    }
}
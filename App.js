import Expo, { Permissions } from 'expo';
import React from 'react';
import {
    Text,
    View,
    Image,
    TextInput,
    Keyboard,
    Animated,
    KeyboardAvoidingView,
    Clipboard,
    StatusBar,
    AsyncStorage
} from 'react-native';
import { getPassword, getHash } from 'super-secret-settings';
import * as base64 from 'base-64';

export default class App extends React.Component {

    static DataStoreStrings = [
        '@SSSNative:password',
        '@SSSNative:service'
    ];

    state = {
        success: false,
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

    componentDidMount(){
        this.scanFingerPrint();
    }

    async scanFingerPrint() {
        const { success } = await Expo.Fingerprint.authenticateAsync();
        if(success) {
            this.setState({ success });
        } else {
            setTimeout(_ => this.scanFingerPrint(), 1000);
        }
    }

    async componentWillMount() {
        try {
            const password = await AsyncStorage.getItem(App.DataStoreStrings[0]);
            const service = await AsyncStorage.getItem(App.DataStoreStrings[1]);
            this.setState({
                password: password !== null ? base64.decode(password) : '',
                service: service !== null ? base64.decode(service) : ''
            });
        } catch (error) {
            console.error(error);
        }
    }

    getShortHash() {
        return getHash(this.state.password).substring(0, 6);
    }

    getShortHashText() {
        return this.state.success
            ? this.getShortHash()
            : '';
    }

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

        const inputs = <KeyboardAvoidingView behavior='padding' style={{
                flex: 0,
                backgroundColor: '#000'
            }}>
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
            </KeyboardAvoidingView>;

        return (
            <View style={{flex: 1}}>
                <StatusBar hidden={true}/>
                <View style={{
                    flex: 6,
                    backgroundColor: `#${this.getShortHash()}`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    }}>
                    <Image source={this.state.image} style={{width: 160, height: 160}}/>
                    <Text style={{ color: '#fff' }}>{this.getShortHashText()}</Text>
                </View>
                {this.state.success ? inputs : <View/>}
            </View>
        );
    }
}
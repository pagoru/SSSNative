import 'expo';
import React from 'react';
import { Text, View, Image, TextInput, Keyboard, Animated, KeyboardAvoidingView, Clipboard, StatusBar } from 'react-native';
import { getPassword, getHash } from 'super-secret-settings';

function getShortHash(text, len = 8) {
    return getHash(text).substring(0, len);
}

export default class App extends React.Component {

    static colors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];

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

    componentWillMount() {
        this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
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

    onChangePassword(password){
        this.setState({ password });
    }

    onChangeService(service){
        this.setState({ service });
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
                    <MyText>{getShortHash(this.state.password)}</MyText>
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
function MyText(props) {
    return (
        <Text style={{
            color: '#fff'
        }}>
            {props.children}
        </Text>
    );
}

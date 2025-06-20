import React, {useState, useContext, use} from 'react'
import './Auth.css';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {useForm} from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import {VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH} from '../../shared/util/validators'
import {VALIDATOR_EMAIL} from '../../shared/util/validators'
import {AuthContext} from '../../shared/context/auth-context'


const Auth = () => {
    const auth = useContext(AuthContext);
    const [isLoginMode, setIsLoginMode] = useState(true);
    
    const {isLoading, error, sendRequest, clearError} = useHttpClient();

    const [formState, inputHandler, setFormData] = useForm({
        email:{
            value:'',
            isValid:false
        }, 
        password:{
            value:'',
            isValid:false
        }
    }, false);

const authSubmitHandler = async event =>{
    event.preventDefault();

    console.log(formState.inputs);

    if(isLoginMode){
        try{
            const responseData = await sendRequest(
                'http://localhost:5000/api/users/login', 
                'POST',
                JSON.stringify({
                    email: formState.inputs.email.value,
                    password: formState.inputs.password.value
                }),
                {
                    'Content-Type': 'application/json'
                }
            ); 
            auth.login(responseData.userId, responseData.token);
        }
        catch(err){};
    }
    else{
        try{
            const formData = new FormData();
            formData.append('email', formState.inputs.email.value);
            formData.append('name', formState.inputs.name.value);
            formData.append('password', formState.inputs.password.value);
            formData.append('image', formState.inputs.image.value);
            const responseData = await sendRequest(
                process.env.REACT_APP_BACKEND_URL+'/users/signup', 
                'POST',
                formData
            );
         
            auth.login(responseData.userId, responseData.token);
        }
        catch(err){};
    }
    
}

const switchModeHandler = () =>{
    if(!isLoginMode){
        setFormData({
            ...formState.inputs,
            name:undefined,
            image:undefined
        },
             formState.inputs.password.isValid && formState.inputs.email.isValid && formState.inputs.password.isValid);
    }
    else{
        setFormData({
            ...formState.inputs,
            name: {
                value:'',
                isValid:false
            },
            image: {
                value:null,
                isValid:false
            }
        }, false);
    }
    setIsLoginMode(prevMode => !prevMode);
}



  return (
    <React.Fragment>
    <ErrorModal error={error} onClear={clearError}/>
    <Card className='authentication'>
        {isLoading && <LoadingSpinner as Overlay/>}
        <h2>Login Required</h2>
        <hr />
    <form onSubmit={authSubmitHandler}>
        {!isLoginMode && <Input 
        element="input"
        id="name"
        type="text"
        label="Your Name"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a name."
        onInput = {inputHandler}
        />}
        <Input 
        id="email" 
        element="input" 
        type="email" 
        label="E-Mail" 
        validators={[VALIDATOR_EMAIL()]} 
        errorText="Please enter a valid email address." 
        onInput = {inputHandler}
        />

        {!isLoginMode && (
            <ImageUpload 
            center 
            id="image" 
            onInput={inputHandler}
            errorText="Please provide an image"
            />)}

        <Input 
        id="password" 
        element="input" 
        type="password" 
        label="Password" 
        validators={[VALIDATOR_MINLENGTH(6)]}
        errorText="Please enter a valid password, at least 6 characters." 
        onInput = {inputHandler}
        />

        <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP' }</Button>
    </form>
    <Button inverse onClick = {switchModeHandler}>
        SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN' }
        </Button>
    </Card>
    </React.Fragment>
  )
}

export default Auth;
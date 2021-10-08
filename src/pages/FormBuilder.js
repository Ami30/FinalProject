import React, {useState, useEffect} from 'react';
import { Button, Form, FormGroup, Label, Input, Container, Row, Col, Card, CardBody } from 'reactstrap';
import { validateInput } from '../utils/validations';
import axios from 'axios';
import { ROUTES } from '../routes';
import { toast } from 'react-toastify';
import { useLocalStorageState } from '../hooks/useLocalStorage';
import { FORM_DATA } from '../utils/constants';

const choices_data = ["Asia", "Europe", "Africa", "Americas"];

function FormBuilder() {
    
    //formdata
    const [formData, setFormData] = useLocalStorageState('formData', FORM_DATA);

    const changeFormData = ({field, value}) =>{
        let temp = {};

        if(formData != null){
            if(!!formData.formData){
                // retrieve from session
                temp = {...formData.formData}
            }else{
                // retrieve while user is interacting with form
                temp = {...formData}
            }
        };

        const tempFormData = {...temp, [field] : value};
        setFormData(tempFormData);
    }

    // disable button when we hit api, and enable only after we get response from server
    const [loading, setLoading] = useState(false);

    // label value
    const [inputLabel, setinputLabel] = useState(() => formData != null ? formData.label : "Sales Region");

    // change handler of label value
    const handleInputChange = (e) =>{
        const value = e.target.value;
        setinputLabel(value);
        changeFormData({field : "label" , value});
    }

    //default value
    const [defaultValue, setDefaultValue] = useState(() => formData != null ? formData.defaultValue : "Asia");

   //change handler for default value
    const handleDefaultValueChange = (e) =>{       
        const value = e.target.value;
        setDefaultValue(value);       
        changeFormData({field : "defaultValue" , value});
    }
    
    //isMultiSelect
    const [isMultiSelect, setIsMultiSelect] = useState(() => formData != null ? formData.isMultiSelect : true);

    //chnage handler for isMultiSelect
    const handleMultiSelectChange = (e) =>{
        const value = e.target.checked;
        setIsMultiSelect(value);
        changeFormData({field : "isMultiSelect" , value});
    }

    //choices
    const [choices, setChoices] = useState(() => formData != null ? formData.choices : choices_data);


    // Function for saving the choices
    const saveChoices = () =>{
        if(choices.length < 50){
            if(!choices.includes(defaultValue)){
                setChoices([...choices, defaultValue]);
                changeFormData({field : "choices" , value : [...choices, defaultValue]});
               
            }else{
                toast.error(defaultValue + " already exists in list!");
                // console.log("Option already included");
            }
        }else{
            toast.error("Oops! You cannot add more than 50 choices");
        }
    }

    // Function for deleting choices
    const deleteChoices = () =>{
        
            if(choices.includes(defaultValue)){
                choices.splice(choices.indexOf(defaultValue),1)
                setChoices([...choices]);
                changeFormData({field : "choices" , value : [...choices]});
               
            }else{
                toast.error(defaultValue + " is not present in the list");              
            }
       
    }
 
    //selected choice value
    const [choicesValue, setChoicesValue] = useState(() => formData != null ? formData.choicesValue : choices[0]);

    //change handler for choices
    const handleChoiceChange = (e) =>{
        const value = e.target.value;
        setChoicesValue(value);
        changeFormData({field : "choicesValue" , value});
    }

    //order
    const [order, setOrder] = useState(() => formData != null ? formData.order : "NA");

    //change handler for orderchange
    const handleOrderchange = (e) =>{
        const value = e.target.value;
        setOrder(value);
        changeFormData({field : "order" , value});
        if(value!=="NA"){
            choices.sort();
        }
    }

    useEffect(() => {
        setChoicesValue(defaultValue);
        changeFormData({field : "choicesValue" , value : defaultValue});
    }, [defaultValue]);

    // Hit api and send form data to server
    const saveForm = () =>{
        if(validateInput(inputLabel, "label") && !loading){
            setLoading(true);
            const data = {
                label : inputLabel,
                required : isMultiSelect,
                choices,
                displayAlpha : order !== "NA",
                default : defaultValue
            };

            //using axios to post the data 
            axios.post(ROUTES.SUBMIT_DATA, data)
              .then(function (response) {
                setLoading(false);
                const {data } = response;
                const {status} = data;
                console.log(response);
                toast[status === "success" ? "success" : "error"](status);
              })
              .catch(function (error) {
                setLoading(false);
                console.log(error);
                toast.error(error.message);
              });
        }
    }

    //function for restting the form

    const resetForm = () =>{
        setinputLabel("");
        setDefaultValue("");
        setChoices([]);
        setLoading(false);
        setOrder("NA");
    }

    return (
        <Container>
        <br/>
            <Row>
                <Col lg={{ size: 6, offset: 3 }} md={{size : 10, offset : 1}}> 
                    <Card>
                        <CardBody>
                            <h3>Form Builder</h3>
                            <br/>
                            <Form>
                                <FormGroup>
                                    <Label for="inputLabel">Label</Label>
                                    <Input type="text" 
                                        name="inputLabel" 
                                        id="inputLabel" 
                                        placeholder="Label" 
                                        value={inputLabel} 
                                        onChange={handleInputChange}
                                        />
                                </FormGroup>
                                <br/>
                                <FormGroup tag="fieldset">
                                    <legend>Type</legend>
                                    <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="checkbox" checked={isMultiSelect} 
                                            onChange={handleMultiSelectChange} />{' '}
                                           Multi-select
                                    </Label>
                                   </FormGroup>
                                </FormGroup>
                                <br/>
                                <FormGroup>
                                    <Row>
                                        <Col lg={8} sm={8}>
                                            <Label for="defaultValue">Default Value</Label>
                                            <Input type="text" 
                                                name="defaultValue" 
                                                id="defaultValue" 
                                                placeholder="Label"                                               
                                                value={defaultValue} 
                                                onChange={handleDefaultValueChange}
                                                />
                                        </Col>
                                        <Col lg={2} sm={2}>
                                             <br/>
                                            <Button color="primary" size="md" onClick={saveChoices}>Save</Button> 
                                        </Col>
                                        <Col lg={2} sm={2}>
                                        <br/>
                                            <Button color="danger" size="md" onClick={deleteChoices}>Delete</Button> 
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <br/>
                                    <FormGroup>
                                        <Label for="choices">Choices</Label>
                                        <Input type="select" name="select" id="choices" value={choicesValue} onChange={handleChoiceChange}>
                                            {choices.map(item => <option key={item} value={item}>{item}</option>)}
                                        </Input>
                                    </FormGroup>
                                <br/>
                                    <FormGroup>
                                        <Label for="choices">Order</Label>
                                        <Input type="select" name="select" id="choices" value={order} onChange={handleOrderchange}>
                                            <option>NA</option>
                                           <option>Display choices in alphabetical order</option>
                                        </Input>
                                    </FormGroup>
                                    <br/>
                                <Row>     
                                    <Col lg={{ size: 4, offset : 3}}> 
                                        <Button color="success" size="md" onClick={saveForm}>Save Changes</Button> 
                                    </Col>

                                    <Col lg={{ size: 4 }}> 
                                        <Button color="link" size="md" onClick={resetForm} disabled={loading}>Cancel</Button> 
                                    </Col>
                                </Row>
                        </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
      </Container>
    )
}

export default FormBuilder;

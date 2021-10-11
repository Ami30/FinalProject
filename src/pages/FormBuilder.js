import React, {useState} from 'react';
import { Button, Form, FormGroup, Label, Input, Container, Row, Col, Card, CardBody,ListGroup, ListGroupItem  }  from 'reactstrap';
import { validateInput } from '../utils/validations';
import axios from 'axios';
import { ROUTES } from '../routes';
import { toast } from 'react-toastify';
import { useLocalStorageState } from '../hooks/useLocalStorage';
import { FORM_DATA } from '../utils/constants';

const choices_data = ["Asia", "Europe", "Africa", "Americas"];

function FormBuilder() {
    
    //FORM_DATA is the default data mentioned in the imports which is the initial state of the form on first load.
    //formData is the key to store value of FORM_DATA
    const [formData, setFormData] = useLocalStorageState('formData', FORM_DATA);

    //When there will be any change in formData, this function will be called to update the fields in the local storage
    const changeFormData = ({field, value}) =>{
        let temp = {};

        if(formData != null){
            temp = {...formData}
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

    //change handler for isMultiSelect
    const handleMultiSelectChange = (e) =>{
        const value = e.target.checked;
        setIsMultiSelect(value);
        changeFormData({field : "isMultiSelect" , value});
    }

    //choices(Initially it will be autopopulated with default value)
    const [choices, setChoices] = useState(() => formData != null ? formData.choices : choices_data);


    // Function for saving the choices
    const saveChoices = () =>{
        // If the choices are greater than 50 then user will get an error while saving
        if(choices.length < 50){
            // declared a temporary variable to check the case sensitive choice value
                let add=true;
                for(let i=0;i<choices.length;i++){
                    // checking case sensitivity
                    if((choices[i].toLowerCase()===defaultValue.toLowerCase())){
                        add=false;
                    }

                   
                }
                // If the data is not presesnt after checking case sensitivity then add the data
                if(add===true && defaultValue!=='' && defaultValue!==null){
                setChoices([...choices, defaultValue]);
                // updating data in local storage
                changeFormData({field : "choices" , value : [...choices, defaultValue]});
                }
                else if(defaultValue==='' || defaultValue===null){
                    // If default value is empty then give error notification
                    toast.error("Oops! Your Default Value is empty");
                    return;
                }
                else{
                    // If data is already exists in the array give an error notification
                    toast.error(defaultValue + " already exists in list!");
                    return;
                }

        }else{
            // If there are more than 50 choices then give error notification
            toast.error("Oops! You cannot add more than 50 choices");
            return;
        }
    }

    // Function for deleting choices
    const deleteChoices = () =>{
        // Check if the choice is present in selectedValue
        if(selectedValue!==null || selectedValue!==''){
            // if the choice is present then delete it
            if(choices.includes(selectedValue)){
                choices.splice(choices.indexOf(selectedValue),1)
                setChoices([...choices]);
                // Store the changes in local storage
                changeFormData({field : "choices" , value : [...choices]});
                // set selected value is null as we deleted it above
                setSelectedValue(null);
                // set delete button disablity as true
                setdeletedisabled(true);
            }else{
                // In case the selected value is not present in the choices array then give error notification
                toast.error(selectedValue + " is not present in the list");              
            }
        }
        else{
            // If user has not selected any choice to delete then give error notification
            toast.error("Please select a choice to delete"); 
        }
            
    }


    //Setting order of choices
    const [order, setOrder] = useState(() => formData != null ? formData.order : "NA");

    //change handler for orderchange
    const handleOrderchange = (e) =>{
        const value = e.target.value;
        if(value!=="NA"){
            // Sorting the choices alphabetically
            choices.sort();
        }
        else{
            // Randomly shuffling the choices
            choices.sort(() => Math.random() - 0.5);
        }
        setOrder(value);       
        // storing data in local storage 
        changeFormData({field : "order" , value});
       
    }

    // Hit api and send form data to server
    const saveForm = () =>{
        if(isMultiSelect===true){
        // Validate label and default value first
        if(validateInput(inputLabel, "label") && validateInput(defaultValue, "defaultValue") && !loading){
            // set button loading as true
            setLoading(true);
            // Again checking if user has entered a default value which is not in choices. If not then adding the value to choices.
            if(choices.length < 50){
                 // declared a temporary variable to check the case sensitive choice value
                let add=true;                
                for(let i=0;i<choices.length;i++){
                     // checking case sensitivity
                    if((choices[i].toLowerCase()===defaultValue.toLowerCase())){
                        add=false;
                    }                 
                }
                if(add===true && defaultValue!=='' && defaultValue!==null){
                setChoices([...choices, defaultValue]);
                // updating data in local storage
                changeFormData({field : "choices" , value : [...choices, defaultValue]});
                }               

        }else{
            // if user tries to enter more than 50 choices give error notification
            toast.error("Oops! You cannot add more than 50 choices");
            return;
        }
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
    else{
        toast.error("Please check multi-select");
    }
    }

    //function for resetting the form

    const resetForm = () =>{
        setinputLabel("");
        setDefaultValue("");
        setChoices([]);
        setLoading(false);
        setOrder("NA");
    }

    // Declared constant for getting selected value from the Choices list 
    const [selectedValue,setSelectedValue]=useState();
    // Initially delete button will be disabled 
    const [deletedisabled,setdeletedisabled]=useState(true);
    

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
                                            <Button color="danger" size="md" disabled={deletedisabled} onClick={deleteChoices}>Delete</Button> 
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <br/>
                                    <FormGroup>
                                        <Label for="choices">Choices</Label>

                                        <ListGroup>
                                          {
                                              
                                              choices.map(
                                                  (choice,i) =>{
                                                      return <ListGroupItem key={i} onClick={()=>{setSelectedValue(choice); setdeletedisabled(false)}} style={{backgroundColor: selectedValue === choice ? 'lightgray': 'white'}}> {choice}</ListGroupItem>
                                                  }
                                              )
                                          }
                                        </ListGroup>
                                        
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

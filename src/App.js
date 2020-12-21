import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import moment from "moment";

const url="http://ec2-3-139-71-41.us-east-2.compute.amazonaws.com:8080/tarea/";

class App extends Component {

  state={
    tareas:[],
    modalInsertar: false,
    form:{
      idTarea: '',
      descripcion: '',
      fechaCreacion: '',
      vigenteSi: 'Si',
      vigente: true
    },
    tipoModal: '',
    modalEliminar: false
  }

  modalInsertar=()=>{

    delete this.state.form.idTarea;
    delete this.state.form.descripcion;
    delete this.state.form.fechaCreacion;
    this.state.form.vigenteSi = 'Si';
    this.state.form.vigente = true;
    delete this.state.form.idTarea;

    this.setState({
      modalInsertar: !this.state.modalInsertar,
      form:{
        idTarea: '',
        descripcion: '',
        fechaCreacion: '',
        vigenteSi: 'Si',
        vigente: true
      }
    });
  }

  seleccionarTarea=(tarea)=>{
    var vigente = 'No';

    if(tarea.vigente){
      vigente = 'Si';
    }

    this.setState({
      tipoModal: 'actualizar',
      form:{
        idTarea: tarea.idTarea,
        descripcion: tarea.descripcion,
        fechaCreacion: tarea.fechaCreacion,
        vigenteSi: vigente,
        vigente: tarea.vigente
      }
    });

    console.log(tarea);
  }

  handleChange=async e=>{
    e.persist();
    await this.setState({
      form:{
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    });
  }

  consultarTareas=()=>{
    axios.get(url).then(response=>{

      if(response.data.responseCode && response.data.responseCode == '200'){
        this.setState({tareas: response.data.tareas});
        console.log(response.data.tareas);
      } else {
        console.log(response.data.tareas);
      }
    }).catch(error=>{
      console.log(error.message);
    })
  }

  guardarTarea=async ()=>{
    delete this.state.form.idTarea;
    this.state.form.fechaCreacion = moment();
    this.state.form.vigente = this.state.form.vigenteSi == 'Si';
    console.log(this.state.form);
    await axios.post(url, this.state.form).then(response=>{
      this.modalInsertar();
      this.consultarTareas();
    }).catch(error=>{
      console.log(error.message);
    })
  }

  eliminarTarea=()=>{
    axios.delete(url+this.state.form.idTarea).then(response=>{
      this.setState({modalEliminar: false});
      this.consultarTareas();
    })
  }

  actualizarTarea=async ()=>{
    this.state.form.vigente = this.state.form.vigenteSi == 'Si';
    console.log(this.state.form);
    await axios.put(url, this.state.form).then(response=>{
      this.modalInsertar();
      this.consultarTareas();
    }).catch(error=>{
      console.log(error.message);
    })
  }

  componentDidMount(){
    this.consultarTareas();
  }

  render(){
    const {form}=this.state;
    return (
      <div className="App">
        <br />
        
        <button className="btn btn-success" onClick={()=>{this.setState({form: null, tipoModal: 'insertar'}); this.modalInsertar()}}>Agregar Tarea</button>
        <br /><br />
        <table className="table">
          <thead>
          <tr>
            <th>ID</th>
            <th>Descripcion</th>
            <th>Fecha de creacion</th>
            <th>Vigente</th>
            <th>Acciones</th>
          </tr>
          </thead>
          <tbody>
          {this.state.tareas.map(tarea=>{
            var vigente = 'No';

            if(tarea.vigente){
              vigente = 'Si';
            }

            return(
              <tr>
                <td>{tarea.idTarea}</td>
                <td>{tarea.descripcion}</td>
                <td>{moment(tarea.fechaCreacion).format('YYYY-MM-DD h:mm a')}</td>
                <td>{vigente}</td>
                <td>
                      <button className="btn btn-primary" ><FontAwesomeIcon onClick={()=>{this.seleccionarTarea(tarea); this.setState({modalInsertar: true})}} icon={faEdit}/></button>
                      {"   "}
                      <button className="btn btn-danger"><FontAwesomeIcon onClick={()=>{this.seleccionarTarea(tarea); this.setState({modalEliminar: true})}} icon={faTrashAlt}/></button>
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>

        <Modal isOpen={this.state.modalInsertar}>
          <ModalHeader style={{display: 'block'}}>
            <span style={{float: 'right'}} onClick={()=>this.modalInsertar()}>x</span>
          </ModalHeader>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="idTarea">ID</label>
              <input className="form-control" type="text" name="idTarea" id="idTarea" readOnly onChange={this.handleChange} value={form.idTarea}/>
              <br />
              <label htmlFor="descripcion">Descripcion</label>
              <input className="form-control" type="text" name="descripcion" id="descripcion" onChange={this.handleChange} value={form.descripcion} />
              <br />
              <label htmlFor="vigenteSi">Vigente</label><br />
              <select name="vigenteSi" id="vigenteSi" onChange={this.handleChange} value={form.vigenteSi}>
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
              <input type="hidden" name='fechaCreacion' id='fechaCreacion' onChange={this.handleChange} value={form.fechaCreacion} />
            </div>
          </ModalBody>

          <ModalFooter>

            {this.state.tipoModal=='insertar'?
              <button className="btn btn-success" onClick={()=>this.guardarTarea()}>
              Insertar
            </button>: <button className="btn btn-primary" onClick={()=>this.actualizarTarea()}>
              Actualizar
            </button>
            }
              <button className="btn btn-danger" onClick={()=>this.modalInsertar()}>Cancelar</button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.modalEliminar}>
          <ModalBody>
              Estás seguro que deseas eliminar la tarea '{form.descripcion}'
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={()=>this.eliminarTarea()}>Sí</button>
            <button className="btn btn-secundary" onClick={()=>this.setState({modalEliminar: false})}>No</button>
          </ModalFooter>
        </Modal>

      </div>
    );
  }
}
export default App;

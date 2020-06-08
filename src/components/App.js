import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import ipfs from './ipfs';
import Meme from '../abis/Meme.json' 

class App extends Component {

  async componentWillMount(){
    
    if(!this.ethEnabled()){
      window.alert("no meta mask");
    }

    await this.loadBlockchainData();
  }

  async loadBlockchainData(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
     this.setState({account:accounts[0]});
    //console.log(accounts);
    const networkId = await web3.eth.net.getId();
    //console.log(networkId);
    const networkData = Meme.networks[networkId];
    if(networkData){
      //console.log("contract deployed and fetching abi...");
      const abi = Meme.abi;
      const address = networkData.address;
      //creating the web3 representation of contract
      const contract = web3.eth.Contract(abi, address);
      this.setState({contract});
      //console.log("contract ",contract);
      const imageHash = await contract.methods.get().call();
      this.setState({imageHash});
      //console.log(this.state.imageHash);
    }
    else{
      window.alert("smartcontract is not deployed");
    }

  }

  constructor(props){
    super(props);
    this.state = {
      account: '',
      contract: null,
      buffer:null,
      imageHash:'Qma9i4Vi3Nm82FLKkZ9yTX1iY1SNrsMqfyrp8gBnSN9HAi'
    };
  }

ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
}  
  

  captureFile = (event) => {
    //console.log(this.imageHash)
    event.preventDefault();
    // console.log(event.target.files); 
    const file = event.target.files[0]; 
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = ()=>{
      this.setState({'buffer':Buffer(reader.result) });
      console.log('file loaded');
    }
  }
  //file default hsh - Qma9i4Vi3Nm82FLKkZ9yTX1iY1SNrsMqfyrp8gBnSN9HAi
  //file 2 hash - QmcbRc7o5Gwk83S6s6GhFKXku8LaCaobQdBqzBCxHZCWqG
  // url - https://ipfs.infura.io/ipfs/Qma9i4Vi3Nm82FLKkZ9yTX1iY1SNrsMqfyrp8gBnSN9HAi
  onSubmit = async (event) =>{
    event.preventDefault();
    console.log("submitting ...");
    for await (const result of ipfs.add(this.state.buffer)) {
    console.log(result)
    const imageHash = result['path']
    this.state.contract.methods.set(imageHash).send({from:this.state.account}).then((r)=>{
      this.setState({imageHash:imageHash});
      console.log(this.state.imageHash);
    });
    this.setState({imageHash:imageHash})
    }

  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Image App
          </a>
          <ul className = "navbar-nav px-3">
            <li className = "nav-item text-nowwrap d-none d-sm-none d-sm-block">
              <small className = "text-white">{this.state.account}</small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.imageHash}`} className="App-logo" alt="logo" />
                </a>
                <p>&nbsp;</p>
                <h2>change image</h2>
                <form onSubmit = {this.onSubmit}>
                  <input type = 'file' onChange = {this.captureFile}/>
                  <input type = 'submit' />
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

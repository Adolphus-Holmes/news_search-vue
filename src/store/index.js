import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
//import _this from '../main.js'
Vue.use(Vuex)
const userinfo_model = {
  state: {
    logined:false,
    info:{
      username:"",
      petname:"",
      subscribe:[]
    }
  },
  mutations: {
    set_logined(state){
      state.logined = true;
    },
    set_user_info(state,data){
      state.info.username = data.username
      state.info.petname = data.petname
      state.info.subscribe = data.subscribe
    },
    set_userinfo_subscribe(state,subscribe){
      state.info.subscribe = subscribe
    },
    set_userinfo_petname(state,petname){
      state.info.petname = petname
    },
    clear_info(state){
      state.logined = false;
      state.info.username = ""
      state.info.petname = ""
      state.info.subscribe = []
    },
  },
  actions: {
    get_info({ commit }){
      let url = "/api/userinfo"
      axios.get(url, {}).then((data)=>{
        if(data.data){
          commit('set_user_info',data.data)
          commit('set_logined')
        }
      })
    },
    async set_subscribe({ commit, state}, {word,num}){
      let subscribe = [...state.info.subscribe]
      if(num < 0){//传入的add_num为-1或0-n，前者意味增加，后者则是对应关键词于列表的索引
        subscribe.unshift(word)
      }else{
        subscribe.splice(num,1)
      }
      console.log(subscribe)
      let url = "/api/setsubscribe";
      let data = await axios.patch(url, subscribe)
      if(data.data){
        commit('set_userinfo_subscribe',subscribe)
      }
      return data.data;
    },
    async set_petname({ commit }, petname){
      let url = "/api/setpetname";
      let data = await axios.patch(url, {petname:petname});
      if(data.data){
        commit('set_userinfo_petname',petname)
      }
      return data.data;
    },
    async logout({ commit }){
      let url = "/api/logout";
      let data = await axios.delete(url,{});
      if(data.data){
        commit('clear_info')
      }
      return data.data;
    },
  },
  getters: {
    read_user_info: state =>{
      return state.info
    },
    read_logined: state =>{
      return state.logined
    }
  }
}

const keyword_model = {
  state: {},
  mutations: {},
  actions: {}
}
export default new Vuex.Store({
  
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    user_info : userinfo_model,
    keyword : keyword_model
  }
})

<template>
  <div class="home">
    <el-container>
      <el-header style="padding:0px;height:80px">
        <el-row style="background: #C0C4CC;">
          <el-col :span="19">
            <el-page-header @back="goBack" title="关于" content="主页" style="padding: 24px;padding-left: 44px;line-height:24px;font-size: 20px;">
            </el-page-header>
          </el-col>
          <el-col :span="5" style="padding-left:20px;padding-top:5px;">
            <el-dropdown type="primary" @command="handleCommand">
                <div class="demo-basic--circle">
                    <div class="block"><el-avatar :size="70" :src="require('../static/images/Eye_of_Providence.svg')"></el-avatar></div>
                    <!--html <div class="block" v-for="size in sizeList" :key="size">
                    <el-avatar :size="size" :src="circleUrl"></el-avatar>
                    </div> -->
                </div>
                <el-dropdown-menu slot="dropdown">
                    <li style="list-style: none;line-height: 36px;padding: 0 20px;margin: 0;font-size: 14px;color: #606266;outline: 0;" v-if="logined">你好，{{petname}}</li>
                    <el-dropdown-item v-if="!logined" command="login">登录</el-dropdown-item>
                    <el-dropdown-item v-if="logined" command="center">个人中心</el-dropdown-item>
                    <el-dropdown-item v-if="logined" command="logout">注销</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
          </el-col>  
        </el-row>
      </el-header>
      <el-main>
        <el-row>
          <el-col :span="24"><div class="logo large" style="padding-top:20px;"></div></el-col>
        </el-row>
        <el-row>
          <el-col :span="14">
            <div style="padding-top:30px;display:inline-block">
              <ul class="searchList">
                <li class="searchItem current" data-type="question">新闻资讯</li>
              </ul>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="inputArea">
              <el-autocomplete  class="searchInput" :fetch-suggestions="querySearch"  :trigger-on-focus="false" @select="gotosearch" placeholder="请输入搜索内容" v-model="keyword" @input="onInput()" @keypress.enter.native="gotosearch()"></el-autocomplete>
              <el-button type="primary" icon="el-icon-search" :loading="false" @click="gotosearch()">搜索</el-button>
            </div>
          </el-col>
        </el-row>
        <div class="historyArea">
          <p class="history">
            <label style="color: #2c3e50;float:left">热门搜索：</label>
            <a v-for="key in hotkey" :key="key" :href="'/search?keyword='+key+'&page=1'" style="color: #41D1B4;">{{ key }}</a>
          </p>
          <p class="history mysearch">
            <label style="color: #2c3e50;float:left">我的搜索: </label>
            <a v-for="history in historyList" :key="history" :href="'/search?keyword='+history+'&page=1'" style="color: #41D1B4;">{{ history }}</a>
          </p>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
// @ is an alias to /src
import axios from 'axios';
export default {
  name: 'Home',
  data() {
    return{
      keyword:"",
      logined:false,
      hotkey:[],
      historyList:[],
    }
  },
  components: {
  },
  methods:{
    onInput(){
      this.$forceUpdate();
    },
    gotosearch(){
      if(this.keyword == ''||this.keyword.trim().length == 0){//.trim()意义在于去掉头尾空格，倘若一个输入数据全由空格组成，自然头尾全是空格
        location.reload();
      }else{
        console.log(this.keyword.trim())
        this.$router.push({path:'/search',query:{keyword:this.keyword,page:1}});
      }
    },
    handleCommand(command){
      if(command == "login"){
          window.addEventListener('message',function(e){
              if(e.origin !== window.location.host){
                  if(e.data == true){
                      location.reload();
                  }
              }
          },false);
          window.open(location.origin+'/login','_blank','width=450,height=500,menubar=no,toolbar=no,status=no,scrollbars=yes')
      }
      if(command == 'center'){
          this.$router.push('/center');
      }
      if(command == 'logout'){
        if(this.$cookies.isKey('XSRF-TOKEN')){
            let url = "/api/logout";
            axios.delete(url, {}).then((data)=>{
                if(data.data){
                    sessionStorage.clear();
                    this.$cookies.remove('XSRF-TOKEN');
                    this.setinfo();
                    location.reload();
                }else{
                this.$message.error('操作出错');
                }
            }
            )
        }
      }
    },
    goBack(){
      this.$router.push('/about');
    },
    querySearch(queryString, cb){
            let url = "/api/completion";
            let suggest = new Array();
            axios.get(url, {
                params: {
                    keyword:queryString,
                    }
            }).then((data )=>{
                for(var i=0;i<data.data.length;i++){
                    suggest.push({value:data.data[i]}); 
                }
                cb(suggest);
            });
    },
    getLocalKey() {
      //如果本地存储的数据historyList有值，直接赋值给data中的historyList
      if (JSON.parse(localStorage.getItem("historyList"))) {
          this.historyList = JSON.parse(localStorage.getItem("historyList"));
      }else {
          this.historyList = [];
      }  
    },
    async gethotkey(){
      let url = "/api/hotkey";
      let response = await axios.get(url, {
      params: {
          }
      })
      this.hotkey = response.data;
    },
    async setinfo(){
        if(!this.getinfo()){
            let url = "/api/userinfo"
            let response = await axios.get(url, {});
            if(response.data){
                sessionStorage.setItem("username", response.data.username);
                if(response.data.petname){
                    sessionStorage.setItem("petname", response.data.petname);
                }
                sessionStorage.setItem("subscribe", JSON.stringify(response.data.subscribe));
                this.logined = true;
                this.getinfo();
            }else{
                sessionStorage.clear();
                this.$router.push('/home');
            }
        }else{
          this.logined = true;
        }
      },  
      getinfo(){
        if(!sessionStorage.getItem("username")){
            return false;
        }
        this.username = sessionStorage.getItem("username");
        if(JSON.parse(sessionStorage.getItem("subscribe"))) {
            this.subscribe = JSON.parse(sessionStorage.getItem("subscribe"));
        }else {
            this.subscribe = [];
        }
        if(sessionStorage.getItem("petname") != null){
            this.petname = sessionStorage.getItem("petname");
            this.init_petname = sessionStorage.getItem("petname");
        }
        return true;
    },
  },
  created(){
    if(this.$cookies.isKey('logeed') && !sessionStorage.getItem("petname")){
      this.setinfo();
    }
  },
  activated(){
    if(sessionStorage.getItem("petname") != null){
      this.logined = true; 
    }
    this.gethotkey();
    this.getLocalKey();
    document.title = "主页 - 个人新闻检索网站"
  }
}
</script>
<style scoped src="../static/css/index.css">
  .el-input__inner{
    height: 50px;
    line-height: 50px;
    font-size: initial;
  } 
  .el-button{
    line-height: initial;
    font-size: 16px;
  }
  .el-button--primary {
    background-color: #41D1B4;
    border-color: #41D1B4;
  } 
</style>
<style>
@import '../static/css/style.css'; 
</style>

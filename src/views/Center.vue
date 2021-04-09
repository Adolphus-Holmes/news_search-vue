<template>
    <div class="center">
        <el-container>
            <el-header style="padding:0px;height:80px">
                <el-row style="background: #C0C4CC;"> 
                  <el-col :span="19">
                    <el-page-header @back="goBack" title="返回" content="个人中心" style="padding: 24px;padding-left: 44px;line-height:24px;font-size:20px;">
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
                            <el-dropdown-item command="logout">注销</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                  </el-col>
                </el-row>
            </el-header>
            <el-container style="padding-top:10px">
            <el-aside style="width: 55vh;" v-if="!seehistory">
                <el-scrollbar style="height:87vh;">
                <ul class="infinite-list"  style="padding-left:10px;height:83v;hoverflow:auto;" v-infinite-scroll="load" :vertical="false" infinite-scroll-immediate="false" >
                    <div v-for="(items,indexs) in subscribedata" v-bind:key="indexs" >
                        <div v-for="(item,index) in subscribedata[indexs]" v-bind:key="index">
                            <el-card shadow="hover" class="newscard" style="position: relative;height:90px;font-size:16px;text-align:left;-moz-user-select:none;" @click.native="setArticle(item)">
                            {{item.title}}
                                <el-row style="position:absolute;bottom: 0;">
                                    <el-col :span="24" style="font-size:12px">{{item.release_date.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,"$2月$3日 $4:$5")}}</el-col>
                                </el-row>
                            </el-card>
                        </div>
                    </div>
                </ul>
                </el-scrollbar>
            </el-aside>
            <el-aside style="width: 30vh;" v-if="seehistory">
            </el-aside>
            <el-main>
                <div v-if="!seehistory && Article.title">
                    <el-scrollbar style="height:81vh;">
                        <div style="padding-right:20px;width:97%;text-align:left">
                            <el-row>
                                <el-col :span="24"><h1 style="font-size:20px;">{{Article.title}}</h1></el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="24" style="font-size:16px;padding-bottom:-30px" v-if="Article.subtitle"><h3>{{Article.subtitle}}</h3></el-col>
                            </el-row>
                            <el-row style="font-size:12px;padding-top:15px;">
                                <el-col :span="6" v-show="Article.release_date">{{Article.release_date.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,"$1年$2月$3日 $4:$5:$6")}}</el-col>
                                <el-col :span="6" v-show="Article.source">{{Article.source}}</el-col>
                                <el-col :span="6" v-show="Article.author">作者：{{Article.author}}</el-col>
                            </el-row>
                            <el-divider></el-divider>
                            <div style="white-space:pre-wrap;text-align:left;font-size:16px;">
                                {{Article.text}}
                            </div>
                            <br>
                            <el-row style="font-size:14px;">
                                <el-col :span="12" v-show="Article.editor">责编：{{Article.editor}}</el-col>
                                <el-col :span="12"><el-link :href=Article.url target="_blank" style="float:right">查看原文</el-link></el-col>
                            </el-row>
                            <el-divider></el-divider>
                            <el-row style="padding-right:20px;width:97%;text-align:left">
                              <el-col :span="24"><h2 style="font-size:18px;">相似文章</h2></el-col>
                            </el-row>
                        </div>
                    </el-scrollbar>
                </div>
                <div class="history" v-if="seehistory">
                    <el-row>
                        <el-col :span="6"><el-button type="danger" style="float:left;"  @click="delrecord()">删除选中</el-button></el-col>
                        <el-col :span="13">
                            <div style="float:left;">
                                <span style="font-size:16px;padding-right:5px">选择日期区间:</span>
                                <el-date-picker
                                v-model="datevalue"
                                type="daterange"
                                align="right"
                                unlink-panels
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                :picker-options="pickerOptions"
                                >
                                </el-date-picker>
                            </div>
                            <el-button @click="gotosearch()" >查找搜索记录</el-button>
                        </el-col>
                    </el-row>
                    <el-row style="padding-top:25px">
                      <el-col :span="24">
                          <label v-if="history.length <=0" style="font-size: 16px;">没有搜索记录！</label>
                      </el-col>
                    </el-row>
                    <el-timeline :reverse="false" style="padding-top:25px">
                        <el-timeline-item
                        v-for="(item, index) in history"
                        :key="index"
                        :timestamp="item.date"
                        placement = "top">
                            <el-table
                                ref="multipleTable"
                                :data="item.data"
                                tooltip-effect="dark"
                                style="width: 100%"
                                @selection-change="handleSelectionChange($event,index)"
                                :show-header="false"
                                :row-style="{height: '35px'}"
                                :cell-style="{padding: '1'}">
                                <el-table-column
                                type="selection"
                                width="55">
                                </el-table-column>
                                <el-table-column
                                width="300">
                                <template slot-scope="scope">{{ scope.row.date.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,"$4:$5:$6") }}</template>
                                </el-table-column>
                                <el-table-column
                                prop="keyword"
                                width="500">
                                </el-table-column>
                            </el-table>
                        </el-timeline-item>
                    </el-timeline>
                    <el-row>
                      <el-col :span="19">
                        <el-button-group style="float:right">
                            <el-button type="primary" :disabled="pagenum <= 1?true:false" icon="el-icon-arrow-left" @click="page(-1)">上一页</el-button>
                            <el-button type="primary" :disabled="pagenum >= count?true:false" @click="page(1)">下一页<i class="el-icon-arrow-right el-icon--right"></i></el-button>
                        </el-button-group>
                      </el-col>
                    </el-row>
                </div>
            </el-main>
            <el-aside style="width: 20vh;" >
                <el-row>
                  <el-col :span="24" style="height:20vh"></el-col>
                </el-row>
                <el-row style="padding-top:10vh" v-if="!seehistory" >
                    <el-col :span="24">
                        <div class="ibx-advice">
                            <div class="ibx-advice-logo">
                                <i style="padding-top:4px" class="el-icon-time"></i>
                            </div>
                            <div class="ibx-advice-ctx" @click="seehistory = !seehistory">
                                搜索历史
                            </div>
                        </div>
                    </el-col>
                </el-row>
                <el-row style="padding-top:10vh" v-if="seehistory && subscribe.length"> 
                  <el-col :span="24">
                      <div class="ibx-advice">
                        <div class="ibx-advice-logo">
                            <i style="padding-top:4px" class="el-icon-s-management"></i>
                        </div>
                        <div class="ibx-advice-ctx"  @click="seehistory = !seehistory">
                            查看订阅
                        </div>
                      </div>
                  </el-col>
                </el-row>
                <el-row style="padding-top:10vh">
                  <el-col :span="24">
                      <div class="ibx-advice">
                        <div class="ibx-advice-logo">
                            <i style="padding-top:4px" class="el-icon-setting"></i>
                        </div>
                        <div class="ibx-advice-ctx" @click="drawer = true">
                            账户设置
                        </div>
                      </div>
                  </el-col>
                </el-row>
            </el-aside>
            </el-container>
        </el-container>
        <el-drawer
        title="设置"
        :visible.sync="drawer"
        :with-header="false"
        size="25%">
        <el-container>
            <el-header>
                <el-row>
                <el-col :span="24">
                    <i style="padding-top:15px" class="el-icon-setting">设置</i>
                </el-col>
                </el-row>
            </el-header>
            <el-main style="padding-top:15px">
                <el-table :data="subscribe" :row-style="{height: '35px'}"  :cell-style="{padding: '5px 0'}" style="padding-top:15px">
                  <el-table-column label="订阅列表"><template slot-scope="scope"><span>{{ scope.row }}</span></template></el-table-column>
                  <el-table-column label="添加" scoped-slot>
                      <template slot="header">
                          <el-button style="float:right;height:100%" size="medium" round icon="el-icon-plus" @click = "innerVisible = true"></el-button>
                      </template>
                      <template slot-scope="scope">
                          <el-button style="float:right;height:100%" size="medium" type="danger" round icon="el-icon-delete" @click = "subscribedel(scope.$index)"></el-button>
                      </template>
                    </el-table-column>
                </el-table>
                <el-row style="padding-top:15px">
                    <el-col :span="4" style="height:40px;line-height: 1;"><span style="padding-top:2vh;display: inline-block;font-size: 14px;vertical-align: baseline;" >昵称：</span></el-col>
                    <el-col :span="14">
                        <el-input v-model="petname" :disabled="enable" style="float:right"></el-input>
                    </el-col>
                    <el-col :span="6">
                        <el-button  style="float:right" @click="enable = false" v-if="enable">更改</el-button>
                         <el-button  style="float:right" @click="setpetname()" v-else-if="!enable" type="primary">保存</el-button>
                    </el-col>
                </el-row>
                <el-row style="padding-top:25px">
                    <el-col :span="24">
                        <el-button  style="float:left;" @click="wordVisible = true">重置密码</el-button>
                    </el-col>
                </el-row>
                <el-row style="padding-top:25px;">
                  <el-col :span="24" >
                    <el-row >
                      <el-col :span="24">
                          <span style="display: inline-block;font-size: 14px;float:left;">发送搜索记录到服务器</span>
                      </el-col>
                    </el-row>
                    <el-row >
                        <el-col :span="24" style="">
                            <el-switch
                                v-model="pushrecord"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                                active-text="开启"
                                inactive-text="关闭"
                                style="padding-top:13px;float:left;">
                                </el-switch>
                        </el-col>
                    </el-row>
                  </el-col>
                </el-row> 
                <el-row style="padding-top:25px;">
                  <el-col :span="24">
                    <el-row>
                      <el-col :span="24">
                          <span style="display: inline-block;font-size: 14px;float:left;">在本地存储搜索记录</span>
                      </el-col>
                    </el-row>
                    <el-row >
                        <el-col :span="24" style="">
                            <el-switch
                                v-model="saverecord"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                                active-text="开启"
                                inactive-text="关闭"
                                style="padding-top:13px;float:left;">
                                </el-switch>
                        </el-col>
                    </el-row>
                  </el-col>
                </el-row> 
            </el-main>
        </el-container>
        <el-dialog
        width="19%"
        :visible.sync="innerVisible"
        :append-to-body="true"
        :show-close="false"
        top="15vh"
        class="center_dialog">
            <el-row>
            <el-col :span="24"><el-input v-model="onesubscibe"></el-input></el-col>
            </el-row>
            <el-row style="padding-top:15px">
              <el-col :span="24">
                  <el-button type="primary" @click="addsubscribe()" @keypress.enter.native="addsubscribe()" style="float:right">确 定</el-button>
              </el-col>
            </el-row>
        </el-dialog>
        <el-dialog
        width="25%"
        :visible.sync="wordVisible"
        :append-to-body="true"
        :show-close="false"
        top="15vh"
        class="center_dialog">
            <el-form ref="form" :model="form" label-width="80px" :rules="rule" style="padding:15px" inline-message>
                <el-form-item label="当前密码" prop="password">
                        <el-input v-model="form.password" show-password></el-input>
                </el-form-item>
                <el-form-item label="新密码" style="margin-top: 0vh;" prop="newpassword">
                        <el-input v-model="form.newpassword" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认密码" style="margin-top: 0vh;" prop="confirmword">
                        <el-input v-model="form.confirmword"></el-input>
                </el-form-item>
                <el-form-item style="margin-bottom:0">
                    <el-button-group style="float:right">
                        <el-button  @click="resetForm('form')" style="margin-right:10px">取消</el-button>
                        <el-button  type="primary" @click="submitForm()" >确认</el-button>
                    </el-button-group>
                </el-form-item>
            </el-form>
        </el-dialog>
        </el-drawer>
    </div>
</template>
<script>
import axios from 'axios';
import JsEncrypt from 'jsencrypt';
export default {
    name: 'Center',
    data() {
        var validateComfirmPwd = (rule, value, callback) => {
            if (this.form.newpassword !== value) {
                callback(new Error('两次输入的密码不一致'))
            }else{
                callback()
            }
        };
        return{
            history:[],
            line:[],
            username:"",
            count:0,
            subscribe:[],
            onesubscibe:"",
            drawer:false,
            multipleSelection: [],
            wordVisible:false,
            password:"",
            newpassword:"",
            subscribedata:[],
            innerVisible:false,
            Article:{},
            size:25,
            petname:"",
            enable:true,
            seehistory:false,
            pushrecord:true,
            saverecord:true,
            pagenum:1,
            subscribenum:1,
            similar:[],
            pickerOptions: {
            shortcuts: [{
                text: '最近一周',
                onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit('pick', [start, end]);
                }
            }, {
                text: '最近一个月',
                onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                picker.$emit('pick', [start, end]);
                }
            }, {
                text: '最近三个月',
                onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                picker.$emit('pick', [start, end]);
                }
            },
             {
                text: '最近六个月',
                onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 183);
                picker.$emit('pick', [start, end]);
                }
            },
             {
                text: '最近一年',
                onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
                picker.$emit('pick', [start, end]);
                }
            },
            ]
            },
            datevalue: '',
            form: {
                password: "",
                newpassword: "",
                confirmword: "",
            },
            rule:{
                password:[
                    { required: true, message: "请输入当前密码", trigger: "blur" }
                ],
                newpassword:[
                    { required: true, message: "请输入新密码", trigger: "blur" },
                    {
                        required: true,
                        pattern: /^[a-zA-Z0-9~.+\-!@#$%^&*?]{6,18}$/,
                        message: '密码应由6-18位数字、字母或特殊字符(~.+-!@#$%^&*?)组成',
                        trigger: 'blur'
                    }
                ],
                confirmword:[
                    { required: true, message: '请确认密码', trigger: 'blur' },
                    { validator: validateComfirmPwd, trigger: 'blur' }
                ]
            },
        }
    },
    components: {
    },
    methods:{
        goBack(){
            this.$router.go(-1);
        },
        handleCommand(command){
            if(command == 'logout'){
                if(this.$cookies.isKey('XSRF-TOKEN')){
                    let url = "/api/logout";
                    axios.delete(url, {}).then((data)=>{
                        if(data.data){
                            sessionStorage.clear();
                            this.$cookies.remove('XSRF-TOKEN');
                            location.reload();
                        }else{
                        this.$message.error('操作出错');
                        }
                    }
                    )
                }
            }
        },
        async getsubscribe(num){
            if(this.subscribe.length){
                let url = "/api/subscribe?page="+num;
                console.log(this.subscribe);
                let response = await axios.post(url,this.subscribe)
                this.subscribedata.push(response.data);
                console.log(this.subscribedata);
            }
        },
        gotosearch(){
            this.pagenum = 1;
            this.gethistorycount();
            this.gethistory(this.pagenum)
        },
        page(n){
            this.pagenum += n
            this.gethistory(this.pagenum)
        },
        formatdate(list){
            let h= new Array();
            let hitem = {date:"",data:new Array()};
            let hdate="";
            list.forEach((item)=>{
                hdate = item.date.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,"$1年$2月$3日")
                if(hitem.date == hdate){
                    hitem.data.push(item)
                }else{
                    if(hitem.data.length){
                        h.push(hitem)
                    }
                    hitem = {date:hdate,data:new Array()}
                    hitem.data.push(item)
                    return
                }
            })
            if(hitem.data.length){
                h.push(hitem)
            }
            this.history = h
        },
        async gethistorycount(){
            let url = "/api/historycount";
            let start = "";
            let end = "";
            if(this.datevalue){
                end = this.datevalue[1]
                start = this.datevalue[0]
            }
            let response = await axios.get(url, {
                params: {
                    from:start,
                    to:end,
                }
            })
            this.count = Math.ceil(response.data/this.size)
            console.log(this.count)
        },
        async gethistory(num){
            let url = "/api/history";
            let start = "";
            let end = "";
            if(this.datevalue){
                end = this.datevalue[1]
                start = this.datevalue[0]
            }
            let response = await axios.get(url, {
                params: {
                    page:num,
                    size:this.size,
                    from:start,
                    to:end,
                }
            })
            this.formatdate(response.data);
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
                    this.getinfo();
                }else{
                    sessionStorage.clear();
                }
            }
        },
        async addsubscribe(){
            if(this.onesubscibe.trim().length == 0){
                this.$message.error('关键词为空');
                return false
            }
            if(!this.subscribe.includes(this.onesubscibe)) {
                if(this.subscribe.length > 10){
                    this.$message.error('订阅列表已满');
                }else{
                    this.subscribe.unshift(this.onesubscibe);
                    sessionStorage.setItem("subscribe", JSON.stringify(this.subscribe));
                    this.$message({
                    message: '已订阅此关键词',
                    type: 'success'
                    });
                    let url = "/api/setsubscribe";
                    let response = axios.post(url,this.subscribe);
                    this.innerVisible = false
                    return response.data;
                }
            }else{
                this.$message.error('关键词已订阅');
            }
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.wordVisible = false;
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
            }
            return true;
        },
        subscribedel(index){
            this.subscribe.splice(index,1)
            sessionStorage.setItem("subscribe", JSON.stringify(this.subscribe));
            let url = "/api/setsubscribe";
            let response = axios.post(url,this.subscribe);
            return response.data;
        },
        getNowFormatDate(num){
            var date = new Date();
            date.setTime(date.getTime() - 60*60*24*1000*num) 
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = year + "年" + month + "月" + strDate + "日";
            return currentdate;
        },
        load(){
            this.subscribenum +=1;
            this.getsubscribe(this.subscribenum)
            //this.gethistory(this.daynum);
        },
        hload(){
            this.daynum -=1;
            this.gethistory(this.daynum);
        },
        setArticle(item){
            this.Article = item;
            this.Article.text = this.Article.text.replace(/。\s{3,}/g,"。\n　　");
            this.getsimilar()
        },
        async getsimilar(){
            let url = "/vec/similar"
            axios.get(url, {
                params: {
                    keyword:this.Article.title,
                    }
            }).then((data)=>{
                this.similar = data.data
            });
            console.log(this.similar)
        },
        async setpetname(){
            let url = "/api/setpetname"
            let data = {petname:this.petname}
            let response = await axios.patch(url,data)
            if(response.data){
                this.$message({
                type: 'success',
                message: '昵称已更改!'
                });
                sessionStorage.setItem("petname", this.petname);
                this.enable = true;
            }else{
                this.$message.error('未知错误');
            }
            return response.data
        },
        submitForm(){
            this.$refs.form.validate((valid) => {
            if (valid) {
                this.setpassword();
            } else {
                this.$message.error('请正确补完输入数据');
                return false;
            }
            });
        },
        async setpassword(){
            let key = await axios.get("/api/getkey", {params: {}})
            let encrypt = new JsEncrypt()
            encrypt.setPublicKey(key.data)
            let password = encrypt.encrypt(this.form.password)
            let newpassword = encrypt.encrypt(this.form.newpassword)
            let url = "/api/setpassword";
            let data = {password:password,newpassword:newpassword}
            let response = await axios.patch(url,data);
            if(response.data){
                this.$message({
                type: 'success',
                message: '密码已更改!'
                });
            }else{
                this.$message.error('操作出错');
            }
        },
        handleSelectionChange(val,index) {
            console.log(val)
            this.multipleSelection[index]=val;
        },
        async delrecord(){
            let idlist = [];
            this.multipleSelection.forEach((line)=>{
                line.forEach((item)=>{
                    idlist.push(item.id)
                })
            })
            console.log(this.subscribe)
            console.log(idlist)
            let url = "/api/delrecord"
            let response = await axios.delete(url,{data:idlist});//delete操作不同于get、post
            if(response.data){
                this.$message({
                type: 'success',
                message: '记录已删除!'
                });
                this.gethistory(this.pagenum)
            }else{
                this.$message.error('操作出错');
            }
        }
    },
    created(){
    },
    activated(){
        document.title = "个人中心 - 个人新闻检索网站"
        this.setinfo()
        if(!this.subscribe.length){
            this.seehistory = true
        }
        this.gotosearch();
        this.load();
    }
}
</script>
<style scoped>
@import '../static/css/style.css'; 
.el-divider--horizontal{margin-top:10px;margin-bottom:15px}
.newscard{
    -webkit-touch-callout:none;  /*系统默认菜单被禁用*/   
    -webkit-user-select:none; /*webkit浏览器*/   
    -khtml-user-select:none; /*早期浏览器*/   
    -moz-user-select:none;/*火狐*/   
    -ms-user-select:none; /*IE10*/   
    user-select:none;   
}
.ibx-advice{display: flex;align-items: center;justify-content: center;position:fixed;right:-81px;overflow:hidden;height:44px;width:126px;background-color:#FFF;-moz-transition:right .5s;-webkit-transition:right .5s;transition:right .5s;cursor:pointer;z-index:10}
.ibx-advice-logo{width:43px;height:42px;border:1px solid #D6D6D6;border-right:none;cursor:pointer}
.ibx-advice-ctx{line-height:42px;height:42px;width:80px;border:1px solid #D6D6D6;border-left:none;color:#575757;font-size:14px;text-align:center}
.ibx-advice:hover{right:0}
.ibx-advice:hover .ibx-advice-logo{background-color:#1796F9;background-position:-29px -76px;border-color:#1796F9}
.el-icon-setting{font-size: 35px;color:#1796F9;}
.el-icon-s-management{font-size: 35px;color:#1796F9;}
.el-icon-time{font-size: 35px;color:#1796F9;}
.ibx-advice:hover .ibx-advice-logo .el-icon-setting{color:#FFF}
.ibx-advice:hover .ibx-advice-logo .el-icon-s-management{color:#FFF}
.ibx-advice:hover .ibx-advice-logo .el-icon-time{color:#FFF}
</style>
<style>
.el-table::before {
  height: 0px;
}
.customer-table .el-table__fixed-right::before,
.el-table__fixed::before {
  width: 0;
}
.el-timeline-item__timestamp.is-top{float:left;line-height: 23px;font-size: 16px;padding-top: 0px;}
.el-timeline .el-timeline-item:last-child .el-timeline-item__tail {
    display: flex;
}
.el-scrollbar__wrap {
  overflow-x: hidden;
}
.center_dialog .el-dialog{margin-right:12vh}
.center_dialog .el-dialog .el-dialog__header{padding:0}
.center_dialog .el-dialog .el-dialog__body{padding:20px 10px;}
</style>

<template>
    <div class="center">
        <el-container>
            <el-header style="padding:0px;height:80px">
                <el-row style="background: #C0C4CC;"> 
                  <el-col :span="19">
                    <el-page-header @back="goBack" title="主页" content="个人中心" style="padding: 24px;padding-left: 44px;line-height:24px;font-size:20px;">
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
                            <li style="list-style: none;line-height: 36px;padding: 0 20px;margin: 0;font-size: 14px;color: #606266;outline: 0;">你好，{{user_info.petname}}</li>
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
                            <el-card shadow="hover" class="newscard" style="position: relative;height:90px;font-size:16px;text-align:left;-moz-user-select:none;" @click.native="setArticle(item.id)">
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
                <div v-if="!seehistory && Article.title" v-loading="loading">
                    <el-scrollbar ref="view" style="height:81vh;">
                        <div style="padding-right:20px;width:97%;text-align:left">
                            <el-row>
                                <el-col :span="24"><h1 style="font-size:20px;">{{Article.title}}</h1></el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="24" style="font-size:16px;padding-bottom:-30px" v-if="Article.subtitle"><h3 style="font-size:18px;">{{Article.subtitle}}</h3></el-col>
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
                            <div v-if="similar.length">
                                <el-divider></el-divider>
                                <el-row style="padding-right:20px;width:97%;text-align:left">
                                    <el-col :span="24"><h2 style="font-size:18px;margin-bottom:10px">相似文章</h2></el-col>
                                </el-row>
                                <el-card v-for="item,index in similar" :key="index" class="similarcard" style="font-size:16px;text-align:left;" @click.native="setArticle(item.id)">
                                    <span style="padding-left:20px;">{{item.title}}</span>
                                    <el-row style="bottom: 0;">
                                        <el-col :span="24" style="font-size:12px"><span style="padding-left:20px;">{{item.date.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,"$1年$2月$3日 $2月$3日 $4:$5")}}</span></el-col>
                                    </el-row>
                                    <el-divider style="margin-top:5px;margin-bottom:5px"></el-divider>
                                </el-card>
                            </div>

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
                            <div class="ibx-advice-ctx" @click="changesee()">
                                搜索历史
                            </div>
                        </div>
                    </el-col>
                </el-row>
                <el-row style="padding-top:10vh" v-if="seehistory && user_info.subscribe.length"> 
                  <el-col :span="24">
                      <div class="ibx-advice">
                        <div class="ibx-advice-logo">
                            <i style="padding-top:4px" class="el-icon-s-management"></i>
                        </div>
                        <div class="ibx-advice-ctx"  @click="changesee()">
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
                        <div class="ibx-advice-ctx" @click="opendrawer()">
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
                <el-table :data="user_info.subscribe" :row-style="{height: '35px'}"  :cell-style="{padding: '5px 0'}" style="padding-top:15px">
                  <el-table-column label="订阅列表"><template slot-scope="scope"><span>{{ scope.row }}</span></template></el-table-column>
                  <el-table-column label="添加" scoped-slot>
                      <template slot="header">
                          <el-button style="float:right;height:100%" size="medium" round icon="el-icon-plus" @click = "innerVisible = true"></el-button>
                      </template>
                      <template slot-scope="scope">
                          <el-button style="float:right;height:100%" size="medium" type="danger" round icon="el-icon-delete" @click = "subscribedel(scope.row,scope.$index)"></el-button>
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
                        <el-popconfirm title="确认更改昵称？" v-else-if="!enable" @confirm="setpetname()" @cancel="initpetname()">
                            <el-button  style="float:right" slot="reference" type="primary">保存</el-button>
                        </el-popconfirm>
                    </el-col>
                </el-row>
                <el-row style="padding-top:25px">
                    <el-col :span="24">
                        <el-button  style="float:left;" @click="visiblepassword()">重置密码</el-button>
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
                                @change="change('pushrecord',pushrecord)"
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
                                @change="change('saverecord',saverecord)"
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
                        <el-input v-model="form.confirmword" show-password></el-input>
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
import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
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
            key:"",
            petname:"",
            innerVisible:false,
            Article:{},
            loading:false,
            historysize:25,
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
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
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
    computed: {
        ...mapState({

        }),
        ...mapGetters({
            user_info : 'read_user_info'
        }),
    },
    watch:{
        'user_info.subscribe':{
            handler(){
                if(this.user_info.subscribe.length == 0){
                    this.seehistory = true
                    localStorage.setItem("seehistory",this.seehistory);
                }else{
                    this.getsubscribe(1,20).then((data)=>{
                        console.log(data)
                        this.subscribedata = []
                        this.subscribedata.push(data)
                    }) 
                }
            }
        }
    },
    methods:{
        ...mapActions([
            'set_subscribe',
            'set_petname'
        ]),
        goBack(){
            this.$router.push('/home');
        },
        change(name,bool){
            localStorage.setItem(name, bool);
        },
        async getsubscribe(num,size){
            if(this.user_info.subscribe.length){
                let url = "/api/subscribe?page="+num+"&size="+size;
                let response = await axios.post(url,this.user_info.subscribe)
                return response.data;
            }else{
                return []
            }
        },
        async gotosearch(){
            this.pagenum = 1;
            this.gethistorycount();
            this.gethistory(this.pagenum)
        },
        page(n){
            this.pagenum += n
            this.gethistory(this.pagenum)
        },
        opendrawer(){
            this.petname = this.user_info.petname;
            this.drawer = true;
        },
        formatdate(list){
            let h = new Array();
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
            let from = "";
            let to = "";
            if(this.datevalue){
                to = this.datevalue[1]
                from = this.datevalue[0]
            }
            let response = await axios.get(url, {
                params: {
                    from:from,
                    to:to,
                }
            })
            this.count = Math.ceil(response.data/this.historysize)
        },
        async gethistory(num){
            let url = "/api/history";
            let from = "";
            let to = "";
            if(this.datevalue){
                to = this.datevalue[1]
                from = this.datevalue[0]
            }
            let data = {page:num,size:this.historysize,from:from,to:to}
            let response = await axios.get(url, {
                params:data
            })
            this.formatdate(response.data);
        },
        async addsubscribe(){
            if(this.onesubscibe.trim().length == 0){
                this.$message.error('关键词为空');
                return false
            }
            if(!this.user_info.subscribe.includes(this.onesubscibe)) {
                if(this.user_info.subscribe.length > 10){
                    this.$message.error('订阅列表已满');
                }else{
                    this.set_subscribe({word:this.onesubscibe,num:-1}).then((bool)=>{
                        if(bool){
                            this.$message({
                                message: '关键词订阅成功',
                                type: 'success'
                            });
                            this.innerVisible = false
                            this.onesubscibe = ""
                        }else{
                            this.$message.error("操作出错")
                        }
                    })
                }
            }else{
                this.$message.error('此关键词已订阅');
            }
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.wordVisible = false;
        },
        subscribedel(word,index){
            this.set_subscribe({word:word,num:index}).then((bool)=>{
                if(bool){
                    this.$message({
                        type: 'success',
                        message: '订阅关键词已删除!'
                    });
                }else{
                    this.$message.error("操作出错")
                }
            })
        },
        load(){
            this.subscribenum +=1;
            this.getsubscribe(this.subscribenum,10).then((data)=>{
                this.subscribedata.push(data)
            }) 
        },
        async setArticle(id){
            if(this.Article.title){
                this.$refs['view'].wrap.scrollTop = 0
            }
            this.loading = true
            let url = "/api/find";
            let response = await axios.get(url, {
            params: {
                id: id,
                }
            })
            this.loading = false
            this.Article = response.data;
            this.Article.text = "\t"+this.Article.text.trim()
            this.Article.text = this.Article.text.replace(/。\s{3,}/g,"。\n　　");
            this.getsimilar()
        },
        async getsimilar(){
            let url = "/vec/similar"
            axios.get(url, {
                params: {
                    title:this.Article.title,
                    }
            }).then((data)=>{
                this.similar = data.data
            });
        },
        initpetname(){
            this.petname = this.user_info.petname;
            this.enable = true;
        },
        async setpetname(){
            if(this.petname == this.user_info.petname){
                this.$message.error('当前昵称与原先一致');
                return false
            }
            this.set_petname(this.petname).then((bool)=>{
                if(bool){
                    this.$message({
                        type: 'success',
                        message: '昵称已更改!'
                    });
                    this.enable = true;
                    this.petname = this.user_info.petname;
                }else{
                    this.$message.error("操作出错")
                }
            })
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
        visiblepassword(){
            this.wordVisible = true;
            this.getkey();
        },
        async setpassword(){
            let encrypt = new JsEncrypt()
            encrypt.setPublicKey(this.key)
            let password = encrypt.encrypt(this.form.password)
            let newpassword = encrypt.encrypt(this.form.newpassword)
            let url = "/api/setpassword";
            let data = {password:password,newpassword:newpassword,key:this.key}
            let response = await axios.patch(url,data);
            if(response.data){
                this.$message({
                    type: 'success',
                    message: '密码已更改!'
                });
                this.wordVisible = false;
                this.resetForm('form');
            }else{
                this.$message.error('操作出错');
            }
        },
        handleSelectionChange(val,index) {
            this.multipleSelection[index]=val;
        },
        async delrecord(){
            let idlist = [];
            this.multipleSelection.forEach((line)=>{
                line.forEach((item)=>{
                    idlist.push(item.id)
                })
            })
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
        },
        getLocal(){
            this.saverecord = !localStorage.getItem('saverecord')||localStorage.getItem('saverecord')=='true' 
            this.pushrecord = !localStorage.getItem('pushrecord')||localStorage.getItem('pushrecord')=='true' 
            this.seehistory = localStorage.getItem('seehistory')&&localStorage.getItem('seehistory')=='true'//seehistory初始值为false
        },
        changesee(){
            this.seehistory = !this.seehistory;
            localStorage.setItem("seehistory",this.seehistory);
        },
        
    },
    created(){
        this.$store.dispatch("get_info");
    },
    activated(){
        document.title = "个人中心 - 个人新闻检索网站";
        this.getLocal();
        this.gotosearch();
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
.similarcard{box-shadow: none;border:none;
    -webkit-touch-callout:none;  /*系统默认菜单被禁用*/   
    -webkit-user-select:none; /*webkit浏览器*/   
    -khtml-user-select:none; /*早期浏览器*/   
    -moz-user-select:none;/*火狐*/   
    -ms-user-select:none; /*IE10*/   
    user-select:none;   } 
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
.similarcard .el-card__body{padding:0px;}
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

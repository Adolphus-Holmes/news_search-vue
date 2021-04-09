<template>
  <div class="search">
    <el-container>
        <el-header style="height: 80px;position: sticky;top:0;background-color: rgba(255, 255, 255, 1);z-index: 301;">
        <el-backtop target=".el-header"></el-backtop>
        <el-row >
            <a href="/home"><div class="logo" style="padding-top: 30px;"></div></a>
            <div class="inputArea" style="padding-top: 20px;">
                <el-autocomplete  class="searchInput" :fetch-suggestions="querySearch" clearable :trigger-on-focus="false" @select="gotosearch" v-model="keyword" placeholder="请输入搜索内容" @keypress.enter.native="gotosearch()"></el-autocomplete>
                <el-button type="primary" icon="el-icon-search" @click="gotosearch(true)">搜索</el-button>
            </div>
            <el-col :span="4" style="padding-top: 22px;" >
                <el-button type="primary" round style="float: right;" @click.native="dialogVisible = true">高级搜索</el-button>
                <el-button type="primary" @click="subscribe()" v-if="cansubscribe && logined">订阅</el-button>
                <el-button type="primary" @click="subscribe()" v-if="!cansubscribe && logined">取消订阅</el-button>
            </el-col> 
            <el-col :span="4" style="padding-left:20px;padding-top:5px;">
                <el-dropdown type="primary" @command="handleCommand">
                    <div class="demo-basic--circle">
                        <div class="block"><el-avatar :size="70" :src="require('../static/images/Eye_of_Providence.svg')"></el-avatar></div>
                        <!--html <div class="block" v-for="size in sizeList" :key="size">
                        <el-avatar :size="size" :src="circleUrl"></el-avatar>
                        </div> -->
                    </div>
                    <el-dropdown-menu slot="dropdown">
                        <li style="list-style: none;line-height: 36px;padding: 0 20px;margin: 0;font-size: 14px;color: #606266;outline: 0;">你好，{{petname}}</li>
                        <el-dropdown-item v-if="!logined" command="login">登录</el-dropdown-item>
                        <el-dropdown-item v-if="logined" command="center">个人中心</el-dropdown-item>
                        <el-dropdown-item v-if="logined" command="logout">注销</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>  
        </el-row>
        </el-header>
        <div class="nav">
            <ul class="searchList" >
                <li class="searchItem current" data-type="question">新闻资讯</li>
            </ul>
        </div>
        <el-container>
        <el-aside width="200px">
            <div class="sideBar" v-show="false">
                <div class="subfield"><p>数据来源:</p>
                                已爬取数据统计</div>
                <ul class="subfieldContext">
                </ul>
            </div>
        </el-aside>
        <el-main style="padding-top: 0px;">
            <div class="resultArea" v-loading.fullscreen="fullscreenLoading">
                <el-collapse-transition>
                <el-row v-if="!tool" style="height:53px">
                    <el-col :span="12" style="padding-top: 17px;padding-bottom:17px;text-align:left;padding-left:5vh;" >找到约&nbsp;<span class="totalResult">{{total_nums}}</span>&nbsp;条结果(用时<span class="time">{{total_time}}</span>秒)，共约<span class="totalPage">{{Math.ceil(total_nums/page_size)}}</span>页</el-col>
                    <el-col :span="6" style="padding-top: 14px;padding-bottom:10px"><el-button size="mini" style="height:28px;float:left;" @click="tool = !tool">搜索工具</el-button></el-col>
                </el-row>
                </el-collapse-transition>
                <el-collapse-transition>
                <el-row  v-if="tool" style="height:53px">
                    <el-col :span="12" style="padding-top: 14px;padding-bottom:10px">
                      <el-dropdown style="float:left;padding-left:5vh;" @command="sorthandleCommand">
                        <el-button size="mini">
                            {{sort[select.sort].text}}<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <div v-for="(item,index) in sort" :key="index">
                                <el-dropdown-item style="line-height: 30px;" :command="index" :disabled="index == select.sort?true:false">{{item.text}}</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                      </el-dropdown>
                      <el-dropdown style="float:left;padding-left:3vh;" @command="timehandleCommand">
                        <el-button size="mini">
                            <span v-if="select.time >= 0">{{time[select.time].text}}</span>
                            <span v-if="select.time < 0">自定义时间范围</span>
                            <i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <div v-for="(item,index) in time" :key="index">
                                <el-dropdown-item style="line-height: 30px;" :command="index" :disabled="index == select.time?true:false">{{item.text}}</el-dropdown-item>
                            </div>
                            <el-dropdown-item style="line-height: 30px;" :command="-1" :disabled="-1 == select.time?true:false">自定义时间范围</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                      <el-dropdown style="float:left;padding-left:3vh;">
                        <el-button size="mini">
                            {{resultname}}<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item style="line-height: 30px;">正常匹配</el-dropdown-item>
                            <el-dropdown-item style="line-height: 30px;">纠错匹配</el-dropdown-item>
                            <el-dropdown-item style="line-height: 30px;">智能匹配</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                  </el-col>
                    <el-col :span="6" style="padding-top: 14px;padding-bottom:10px"><el-button size="mini" style="height:28px;float:left;" @click="tool = !tool">返回</el-button></el-col>
                </el-row>
                </el-collapse-transition>
                <div class="resultList">
                    <div class="resultItem" v-for="(item,index) in resdate" v-bind:key="item.id" style="line-height:2;">
                        <el-row>
                            <el-col :span="24">
                            <em class="AC-CounterT" style="position:relative;z-index:1;margin-right:4px;display:inline-block;color:white;font-family:'微软雅黑';font-size:16px;text-align:center;width:22px;line-height:22px;border-radius:50%;">{{index+1}}</em>
                            <a :href=item.url target="_blank" class="title" v-html="$xss(item.title)">{{item.title}}</a>
                            </el-col>
                        </el-row>
                        <el-row style="padding-left:4vh;padding-top:5px;padding-bottom:5px">
                            <el-col :span="24">
                                <span style="padding-right:30px;">{{item.source}}</span>
                                <span>{{item.release_date.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,"$1年$2月$3日 $4:$5:$6")}}</span>    
                            </el-col>
                        </el-row>
                        <div class="itemBody" v-html="$xss(item.text)" style="padding-left:1vh;">
                            {{item.text}}
                        </div>
                        <el-row style="padding-left:3.5vh">
                            <el-col :span="24">
                                <i class="el-icon-link"></i>
                                <a :href=item.url style="padding-right:20px">{{item.url.replace(/http[s]?:\/\/(\S+){0,30}/,"$1")}}</a>
                                <el-button size="mini" round @click="gotocache(item.id)">网页存档</el-button>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </div>
        </el-main>
        <el-aside width="300px">
            <div class="sideBar">
                <div class="historyArea">
                    <div class="hotSearch">
                        <h5 style="font-size: 16px;padding-top: 20px;">热门搜索:</h5>
                        <ul class="historyList" style="font-size: 14px;padding-top: 10px;">
                            <li v-for="key in hotkey" :key="key">
                                <a :href="'/search?keyword='+key+'&page=1'">{{ key }}</a>
                            </li>
                        </ul>
                    </div>
                    <div class="mySearch" style="padding-top:10px;">
                        <el-row>
                            <el-col :span="16"><h5 style="font-size: 16px;padding-top:7px;padding-left:80px">搜索历史:</h5></el-col>
                            <el-col :span="6">
                                <el-button type="text" @click="empty()" style="float:left">
                                    <i class="el-icon-delete"></i>
                                </el-button> 
                            </el-col>                       
                        </el-row>
                        <ul class="historyList" style="font-size: 14px;padding-top: 5px;">
                            <li v-for="history in historyList" :key="history">
                                <a :href="'/search?keyword='+history+'&page=1'">{{ history }}</a>
                            </li>
                        </ul>
                    </div>
            </div>
            </div>
        </el-aside>
        </el-container>
        <el-footer>
            <div class="block" style="padding-right: 180px;" v-if="pageshow">
                <el-pagination
                    background
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :page-sizes="[10, 15, 20]"
                    :page-size="page_size"
                    :current-page.sync=page
                    layout="sizes,prev, pager, next"
                    :total="total_nums"
                    hide-on-single-page:true
                    >
                </el-pagination>
            </div>
        </el-footer>
    </el-container>
    <el-dialog
    title="高级搜索"
    :visible.sync="dialogVisible"
    width="40%"
    :before-close="handleClose">
        <el-row style="padding-top: 15px;">
                <el-col :span="6" style="padding-top: 10px;">以下所有字词:</el-col>
                <el-col :span="16">
                    <el-popover
                        placement="right"
                        title="在搜索框中执行以下操作:"
                        width="200"
                        trigger="hover">
                        <p>输入重要字词</p>
                        <p>示例：人民 群众</p>
                        <el-input v-model="querystr.match" slot="reference"></el-input>
                    </el-popover>
                </el-col>
            </el-row>
            <el-row style="padding-top: 15px;">
                <el-col :span="6" style="padding-top: 10px;">与以下字词完全匹配:</el-col>
                    <el-col :span="16">
                        <el-popover
                        placement="right"
                        title="在搜索框中执行以下操作:"
                        width="200"
                        trigger="hover">
                        <p>用英文引号"将需要完全匹配的字词引起</p>
                        <p>示例："手机"</p>
                        <el-input v-model="querystr.must" slot="reference"></el-input>
                        </el-popover>
                    </el-col>
            </el-row>
            <el-row style="padding-top: 15px;">
                <el-col :span="6" style="padding-top: 10px;">不含以下任意字词:</el-col>
                <el-col :span="16">
                    <el-popover
                        placement="right"
                        title="在搜索框中执行以下操作:"
                        width="200"
                        trigger="hover">
                        <p>在不需要的字词前添加一个减号</p>
                        <p>示例：-基站</p>
                        <el-input v-model="querystr.no" slot="reference"></el-input>
                    </el-popover>
                </el-col>
            </el-row>
            <el-row style="padding-top: 15px;">
                <el-col :span="6" style="padding-top: 10px;">以下任意字词:</el-col>
                <el-col :span="16">
                    <el-popover
                        placement="right"
                        title="在搜索框中执行以下操作:"
                        width="200"
                        trigger="hover">
                        <p>在所需字词之间添加或符号|</p>
                        <p>示例：公平|公正|法治</p>
                        <el-input v-model="querystr.or_input[0]" slot="reference"></el-input>
                    </el-popover>
                </el-col>
                <el-col :span="2" style="padding-top: 10px;">
                    <el-button size="mini" icon="el-icon-plus" @click="handleAdd" circle></el-button>
                </el-col>
            </el-row>
            <div v-for="index in or_num" :key="index">
                <el-row style="padding-top: 15px;">
                <el-col :span="5" style="padding-top: 10px;"></el-col>
                <el-col :span="17"><el-input v-model="querystr.or_input[index]"></el-input></el-col>
                <el-col :span="2" style="padding-top: 10px;" v-if="index == or_num">
                    <el-button size="mini" type="danger" icon="el-icon-minus" @click="handleSub" circle></el-button>
                </el-col>
            </el-row>
            </div>
            <el-row style="padding-top: 30px;"><el-col :span="24"></el-col></el-row>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="GenerateQuery">确 定</el-button>
            </span>
    </el-dialog>
    <el-dialog title="自定义日期范围" :visible.sync="timeVisible" width="25%">
        <el-form ref="timevalue" :model="timevalue" :rules="rules">
          <el-form-item label="从：" prop="start">
                <el-date-picker
                v-model="timevalue.start"
                type="date"
                placeholder="选择日期">
                </el-date-picker>
          </el-form-item>
          <el-form-item label="至：" prop="end">
                <el-date-picker
                v-model="timevalue.end"
                type="date"
                placeholder="选择日期">
                </el-date-picker>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="timeVisible = false">取 消</el-button>
            <el-button type="primary" @click="settime()">搜 索</el-button>
        </div>
    </el-dialog>
  </div>
</template>
<script>
import axios from 'axios';
export default {
    name: 'Search',
    data() {
        return{
            keyword:"",
            page:0,
            or_num:0,
            username:"",
            password:"",
            timevalue:{start:"",end:""},
            tool:false,
            subscription:[],
            logined:false,
            dialogVisible: false,
            timeVisible:false,
            cansubscribe:true,
            pageshow:false,
            total_nums:100,
            total_time:0,
            page_size:20,
            sortname:"排序方式",
            timename:"时间范围",
            resultname:"搜索方式",
            sort:[
                {
                    text:'相关度排序',
                    value:'similarity'
                },
                {
                    text:'时间排序',
                    value:'time_desc'
                },
            ],
            match:[
                {
                    text:'正常匹配',
                    value:'normal'
                },
                {
                    text:'纠错匹配',
                    value:'fuzzy'
                },
                {
                    text:'智能匹配',
                    value:'smart'
                },
            ],
            time:[
                {
                    text:'时间不限',
                    value:{
                        end:"",
                        start:"",
                    }
                },
                {
                    text:'最近一天内',
                    value:{
                        end:new Date(),
                        start:new Date((new Date()).getTime() - 3600 * 1000 * 24 * 1),
                    }
                },
                {
                    text:'最近一周内',
                    value:{
                        end:new Date(),
                        start:new Date((new Date()).getTime() - 3600 * 1000 * 24 * 7),
                    }
                },
                {
                    text:'最近一月内',
                    value:{
                        end:new Date(),
                        start:new Date((new Date()).getTime() - 3600 * 1000 * 24 * 30),
                    }
                },
                {
                    text:'最近一年内',
                    value:{
                        end:new Date(),
                        start:new Date((new Date()).getTime() - 3600 * 1000 * 24 * 365),
                    }
                },
            ],
            rules:{
                start:[
                    {type: 'date',required: true, message: '请选择日期', trigger: 'change'}
                ],
                end:[
                    {type: 'date',required: true, message: '请选择日期', trigger: 'change'}
                ],
            },
            select:{
                sort:0,
                time:0,
            },
            resdate:[],
            hotkey:[],
            historyList:[],
            historynum:10,
            querystr: {match:"",must:"",no:"",or_input:new Array()},
            fullscreenLoading: false,
        }
    },
    components: {
    },
    methods:{
        gotosearch(bool){
            if(this.keyword == ''||this.keyword.trim().length == 0){//.trim()意义在于去掉头尾空格，倘若一个输入数据全由空格组成，自然头尾全是空格
                this.$router.push('/home');
            }else{
                let query={}
                query.keyword = this.keyword
                query.page = 1
                if(this.select.sort > 0){
                    query.sort = this.select.sort
                }
                if(this.select.time != 0){
                    query.time = this.select.time
                }
                if(this.select.time < 0){
                    query.start = this.timevalue.start.getTime()
                    query.end = this.timevalue.end.getTime()
                }
                this.$router.replace({path:'/search',query:query});
                if(bool){
                    this.setLocalHistory(this.keyword)
                    this.pushrecord(this.keyword);
                }
                location.reload();
            }
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
        subscribe(){
            if(!this.subscription.includes(this.keyword)) {
                if(this.subscription.length > 10){
                    this.$message.error('订阅列表已满');
                }else{
                    this.subscription.unshift(this.keyword);
                    sessionStorage.setItem("subscribe", JSON.stringify(this.subscription));
                    this.$message({
                    message: '已订阅此关键词',
                    type: 'success'
                    });
                    this.cansubscribe = false;
                }
            }else{
                let i = this.subscription.indexOf(this.keyword);
                this.subscription.splice(i,1)
                sessionStorage.setItem("subscribe", JSON.stringify(this.subscription));
                this.$message('已取消订阅');
                this.cansubscribe = true;
            }
            let url = "/api/setsubscribe";
            let response = axios.post(url,this.subscription);
            return response.data;
        },
        async getsearchid(){
            let url = "/api/searchid";
            let response = await axios.post(url,this.getQuery());
            return response.data;
        },
        async pushrecord(keyword){
            let url = "/api/pushrecord";
            let data = {keyword:keyword}
            let response = await axios.post(url,data);
            return response.data;
        },
        async getdata(){
            this.fullscreenLoading = true;
            setTimeout(() => {
                this.fullscreenLoading = false;
                }, 500);
            let url = "/api/search";
            if(this.page < 1){
                this.page = 1
            }
            let data = {}
            data.keyword = this.keyword;
            data.page = this.page;
            data.size = this.page_size;
            data.sort = this.sort[this.select.sort].value
            if(this.select.time >=0){
                data.start = this.time[this.select.time].value.start
                data.end = this.time[this.select.time].value.end
            }else{
                data.start = this.timevalue.start
                data.end = this.timevalue.end
            }
            console.log(data)
            let response = await axios.get(url, {
                params: data
            })
            this.resdate = response.data;
            this.pageshow = false;
            this.$nextTick(() => {
                this.pageshow = true;
            });//以解决页面刷新时，分页为渲染完毕，选中页面值大于5不能正确选中的情况
        },
        async gettotal(){
            let url = "/api/count";
            let data = {}
            data.keyword = this.keyword;
            if(this.select.time >=0){
                data.start = this.time[this.select.time].value.start
                data.end = this.time[this.select.time].value.end
            }else{
                data.start = this.timevalue.start
                data.end = this.timevalue.end
            }
            let response = await axios.get(url, {
                params: data
            })
            this.total_nums = response.data.count;
            this.total_time = response.data.time;
        },
        async gethotkey(){
            let url = "/api/hotkey";
            let response = await axios.get(url, {
            params: {
                }
            })
            this.hotkey = response.data;
        },
        handleAdd(){
            this.or_num += 1; 
        },
        handleSub(){
            this.querystr.or_input[this.or_num] = ""
            this.or_num -= 1; 
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
                            location.reload();
                        }else{
                        this.$message.error('操作出错');
                        }
                    }
                    )
                }
            }
        },
        gotocache(id){
            let routeUrl = this.$router.resolve({path:'/cache',query:{id:id}});
            window.open(routeUrl.href, '_blank');
        },
        GenerateQuery(){
            let str = "";
            let array = new Array();
            if(this.keyword.trim().length >= 0){
                str += this.querystr.match + " ";
            }
            //this.dialogVisible = false;
            array = this.querystr.must.match(/\S+/g);
            if(array != null){
                array.forEach(function(element) {
                    str += "\"" + element + "\"" + " ";
                });
            }
            array = this.querystr.no.match(/\S+/g);
            if(array != null){
                array.forEach(function(element) {
                    str += "-" + element + " ";
                });
            }
            this.querystr.or_input.forEach(function(arr) {
                array = arr.match(/\S+/g);
                console.log(array);
                if(array != null){
                    array.forEach(function(element,index) {
                        if(index == 0){
                            str += element;
                        }else{
                            str += "|" + element;
                        }
                        if(index == array.length-1){
                            str += " ";
                        }
                    });
                }
            });
            this.dialogVisible = false;
            this.keyword = str;
            this.gotosearch();
        },
        handleClose(done){
            done();
        },
        handleCurrentChange(current){
            //this.page = current;
            this.$scrollTo();//滚动至页面顶部
            this.$router.replace({path:'/search',query:{keyword:this.keyword,page:current}});
            this.getdata();
        },
        handleSizeChange(size){
            this.page_size = size;
            this.getdata();
            this.gettotal();
        },
        setLocalHistory(value) {
            /** 先判断*/
            //this.getLocalKey()//由于进入页面既读取localStorage故无需判断
            /** 搜索历史*/
            // 没有搜索记录，把搜索值push进数组首位，存入本地
            if (!this.historyList.includes(value)) {
                this.historyList.unshift(value);
                if(this.historyList.length > 10){
                    this.historyLis.pop();
                }
                localStorage.setItem("historyList", JSON.stringify(this.historyList));
            }else{
                //有搜索记录，删除之前的旧记录，将新搜索值重新push到数组首位
                let i = this.historyList.indexOf(value);
                this.historyList.splice(i,1)
                this.historyList.unshift(value);
                localStorage.setItem("historyList", JSON.stringify(this.historyList));
            }
            this.$forceUpdate()
        },
        /** 判断 localStorage中 是否有 historyList*/
        getLocalKey() {
            //如果本地存储的数据historyList有值，直接赋值给data中的historyList
            if (JSON.parse(localStorage.getItem("historyList"))) {
                this.historyList = JSON.parse(localStorage.getItem("historyList"));
            }else {
                this.historyList = [];
            }
            if (JSON.parse(sessionStorage.getItem("subscribe"))) {
                this.subscription = JSON.parse(sessionStorage.getItem("subscribe"));//解析出错时会导致整个用户模块失效
            }else {
                this.subscription = [];
            }
            if (this.subscription.includes(this.keyword)){
                this.cansubscribe = false;
            }    
        },
        /** 清空历史搜索记录 */
        empty(){
            this.$confirm('此操作将删除本地历史记录', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(() => {
            localStorage.removeItem('historyList');
            this.historyList = [];
            this.$message({
                type: 'success',
                message: '清空历史搜索成功!'
            });
            }).catch(() => {
            this.$message({
                type: 'info',
                message: '已取消删除'
            });          
            });
        },
        async setinfo(){
            let url = "/api/userinfo"
            let response = await axios.get(url, {});
            if(response.data){
                sessionStorage.setItem("username", response.data.username);
                sessionStorage.setItem("petname", response.data.petname);
                sessionStorage.setItem("subscribe", JSON.stringify(response.data.subscribe));
                this.logined = true;
            }
        },
        sorthandleCommand(command) {
            this.$message('click on item ' + this.sort[command].value);
            this.select.sort = command
            this.gotosearch(false);
        },
        timehandleCommand(command){
            if(command >= 0){
                this.$message('click on item ' + this.time[command].value.start);
                this.select.time = command
                this.gotosearch(false);
            }else{
                this.timeVisible = true;
            }
        },
        settime(){
            this.$refs.timevalue.validate((valid) => {
                if (valid) {
                    this.select.time = -1
                    this.timeVisible = false;
                    console.log(this.timevalue.start,this.timevalue.end)
                    this.gotosearch(false);
                } else {
                    return false;
                }
            });
        },
        toolselect(){
            if(this.$route.query.sort){
                this.select.sort = this.$route.query.sort
                this.tool = true
            }
            if(this.$route.query.time){
                this.select.time = this.$route.query.time
                this.tool = true
            }
            if(this.$route.query.time == -1){
                this.timevalue.start = new Date(parseInt(this.$route.query.start))
                this.timevalue.end = new Date(parseInt(this.$route.query.end))
                console.log(this.timevalue)
            }
        },
        getQuery(){
            let querymap={}
            let match = this.keyword.replace(/"(?<=")(\S+)(?=")"/g,"")
            match = match.replace(/-(?<=-)(\S+)/g,"")
            match = match.replace(/(\S+)\|(\S+)/g,"")
            match = match.trim()
            if(match.length>0){
                querymap.match = match;
            }
            let must = new Array()
            must = this.keyword.match(/(?<=")(\S+)(?=")/g);
            if(must){
                querymap.must = must;
            }
            let not = new Array()
            not = this.keyword.match(/(?<=-)(\S+)/g);
            if(not){
                querymap.not = not;
            }
            let or = new Array()
            let oritem = this.keyword.match(/(\S+)\|(\S+)/g)
            if(oritem){
                oritem.forEach(function(str) {
                        or.push(str.split("|"))
                    });
            }
            if(or){
                querymap.or = or;
            }
            console.log(or)
            console.log(querymap)
            return querymap
        }
    },
    // 生命周期函数
    created(){
        if(this.$cookies.isKey('XSRF-TOKEN') && !sessionStorage.getItem("username")){
            this.setinfo();
        }
        this.gethotkey();
    },
    activated(){//函数在每次进入\刷新时触发
        if(this.$route.query.keyword){
            this.keyword = this.$route.query.keyword;
            this.page = parseInt(this.$route.query.page);
            document.title = this.keyword + " - 个人新闻检索网站"
            this.toolselect();
            this.gettotal();
            this.getsearchid();
            this.getdata();
            this.getLocalKey();
        }else{
            this.$router.push('/home');
        }
        if(sessionStorage.getItem("username") != null){
            this.logined = true; 
        }
        let url = "/vec/vec";
        axios.get(url, {
            params: {
                keyword:this.keyword,
                }
        }).then((data)=>{
            console.log(data.data)
            axios.post("/api/smart",data.data);
        });
    },
    mounted(){//刷新时调用

    },
}
</script>
<style scoped>
  @import '../static/css/style.css'; 
  .AC-CounterT{
      background:#41D1B4;
  }
  .title{
      font-size: 20px;
      line-height: 24px;
  }
  .news-source{
      float: left;
      font-size: 13px;
      line-height: 21px;
  }
  .source-left{
      margin-left:25px;
      margin-right:15px;
  }
</style>
<style>
  em{
      color:#f73131;
  }
</style>
<style src="../static/css/result.css" scoped>
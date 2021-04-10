<template>
    <div class="cache">
        <el-container>
            <el-header style="height:120px;background:#f8f9fa;text-align:left;padding:16px 28px 24px 28px">
                <el-row>
                  <el-col :span="24">来源链接:&nbsp;<el-link :href=Article.url target="_blank" style="font-size: 16px;">{{Article.url}}</el-link></el-col>
                </el-row>
                <el-row style="padding-top:10px"> 
                  <el-col :span="24">抓取时间:&nbsp;{{Article.crawl_date.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d+)/,"$1年$2月$3日 $4:$5:$6 GMT+8")}}</el-col>
                </el-row>
                <el-row style="padding-top:10px"> 
                  <el-col :span="24">网站名称:&nbsp;{{Article.domain}}</el-col>
                </el-row>
            </el-header>
            <el-main style="margin-left: 39vh;width: 60%;line-height:2;">
                <el-row>
                  <el-col :span="24" style="padding-top:20px"><h1>{{Article.title}}</h1></el-col>
                </el-row>
                <el-row>
                  <el-col :span="24" style="padding-top:15px;padding-bottom:10px" v-if="Article.subtitle"><h3>{{Article.subtitle}}</h3></el-col>
                </el-row>
                <el-row>
                  <el-col :span="12" v-show="Article.source">来源网站：{{Article.source}}</el-col>
                  <el-col :span="12" v-show="Article.release_date">发布时间：{{Article.release_date.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,"$1年$2月$3日 $4:$5:$6")}}</el-col>
                </el-row>
                <el-row>
                  <el-col :span="12" v-show="Article.author">作者：{{Article.author}}</el-col>
                  <el-col :span="12" v-show="Article.editor">责编：{{Article.editor}}</el-col>
                </el-row>
                <div style="white-space:pre-wrap;text-align:left;" v-html="$xss(Article.text)">
                    {{Article.text}}
                </div>
            </el-main>
        </el-container>
    </div>
</template>
<script>
import axios from 'axios';
export default {
    name: 'Cache',
    data() {
        return{
            id:"",
            Article:{
                url:"",
                crawl_date:"",
                domain:"",
                title:"",
                subtitle:"",
                source:"",
                release_date:"",
                author:"",
                editor:"",
                text:"",
            },
        }
    },
    components: {
    },
    methods:{
        async getdata(){
            let url = "/api/find";
            let response = await axios.get(url, {
            params: {
                id: this.id,
                }
            })
            this.Article = response.data;
            this.Article.text = "\t"+this.Article.text.trim().replace(/。\s{3,}/g,"。\n　　");
        },
    },
    // 生命周期函数
    activated(){//函数在每次进入\刷新时触发
        if(this.$route.query.id){
            this.id = this.$route.query.id;
            this.getdata();
        }else{
            this.$router.push('/home');
        }
    },
}
</script>
<style>
</style>
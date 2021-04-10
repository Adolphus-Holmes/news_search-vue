<template>
    <div class="login">
        <el-container>
            <el-header>
                <el-row>
                  <el-col :span="24" v-if="!register"><h1 style="font-size:24px;">登录</h1></el-col>
                  <el-col :span="24" v-if="register"><h1 style="font-size:24px;">注册</h1></el-col>
                </el-row>
            </el-header>
            <el-main style="margin-top: 4vh;margin-left: 5vh;width: 80%;">
                <el-alert
                    title="错误提示的文案"
                    type="error"
                    :closable=false
                    center
                show-icon style="margin-bottom: 3vh;" v-show="namesake">
                </el-alert >
                <el-form ref="form" :model="form" label-width="80px" :rules="rule">
                    <el-form-item label="用户名" prop="username">
                        <el-input type="text" v-model="form.username"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="form.password" show-password @keypress.enter.native="submitForm()"></el-input>
                    </el-form-item>
                    <el-collapse-transition >
                        <div v-if="register">
                        <el-form-item label="确认密码" style="margin-top: 7vh;" prop="confirmword">
                            <el-input v-model="form.confirmword" show-password @keypress.enter.native="submitForm()"></el-input>
                        </el-form-item>
                        </div>
                    </el-collapse-transition>
                    <el-form-item style="margin-top: 4vh;"><el-switch
                    v-model="remember"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    active-text="14天内自动登录">
                    </el-switch></el-form-item>
                     <el-form-item>
                        <el-button-group >
                            <el-button v-if="!register" type="primary" icon="el-icon-edit-outline" @click="changeregister">注册</el-button>
                            <el-button v-if="register"  icon="el-icon-back" @click="changeregister">返回</el-button>
                            <el-button v-if="!register" type="primary" @click="submitForm()" v-loading.fullscreen.lock="fullscreenLoading">登录<i class="el-icon-arrow-right el-icon--right"></i></el-button>
                            <el-button v-if="register" type="primary" @click="submitForm()" v-loading.fullscreen.lock="fullscreenLoading">注册并登录<i class="el-icon-arrow-right el-icon--right"></i></el-button>
                        </el-button-group>
                     </el-form-item>
                </el-form>
            </el-main>
        </el-container>
    </div>
</template>
<script>
import axios from 'axios';
import JsEncrypt from 'jsencrypt';
export default {
    name: 'Search',
    data() {
        var validateComfirmPwd = (rule, value, callback) => {
            if (this.form.password !== value) {
                callback(new Error('两次输入的密码不一致'))
            }else{
                callback()
            }
        };
        var RegisterNamesake = async (rule, value, callback) => {
            if (this.register && await this.getnamesake(value)) {
                callback(new Error('用户名已被使用'));
            }else{
                callback();
            }
        }
        return{
            register:false,
            canregister:false,
            namesake:false,
            remember:true,
            fullscreenLoading: false,
            form: {
                username: "",
                password: "",
                confirmword: "",
            },
            key:"",
            rule:{
                username: [
                    { required: true, message: "请输入用户名", trigger: "blur" },
                    {
                        required: true,
                        pattern: /^[a-zA-Z0-9]{5,12}$/,
                        message: '用户名应由5到12位数字或字母组成',
                        trigger: 'blur'
                    },
                    { validator: RegisterNamesake, trigger: 'blur' }
                ],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                    {
                        required: true,
                        pattern: /^[a-zA-Z0-9~.+\-!@#$%^&*?]{6,18}$/,
                        message: '密码应由6-18位数字、字母或特殊字符(~.+-!@#$%^&*?)组成',
                        trigger: 'blur'
                    }
                ],
                confirmword: [
                    { required: true, message: '请输入确认密码', trigger: 'blur' },
                    { validator: validateComfirmPwd, trigger: 'blur' }
                ]
            },
        }
    },
    components: {
    },
    methods:{
        async setinfo(){
            let url = "/api/userinfo"
            let response = await axios.get(url, {});
            sessionStorage.setItem("username", response.data.username);
            sessionStorage.setItem("petname", response.data.petname);
            sessionStorage.setItem("subscribe", JSON.stringify(response.data.subscribe));
        },
        async login(){
            this.fullscreenLoading = true;
            setTimeout(() => {
                this.fullscreenLoading = false;
                }, 1500);
            let encrypt = new JsEncrypt()
            encrypt.setPublicKey(this.key)
            let password = encrypt.encrypt(this.form.password)
            let username = encrypt.encrypt(this.form.username)
            let url = "/api/login";
            let data = {username:username,password:password,key:this.key,longtime:this.remember}
            let response = await axios.post(url,data);
            if(response.data){
                window.opener.postMessage(response.data, window.opener.location.origin);
                this.setinfo();
                this.fullscreenLoading = false;
                window.close();
            }else{
                this.$message.error('账号或密码错误');
            }
            return response.data;
        },
        async toregister(){
            let encrypt = new JsEncrypt()
            encrypt.setPublicKey(this.key)
            let password = encrypt.encrypt(this.form.password)
            let username = encrypt.encrypt(this.form.username)
            this.fullscreenLoading = true;
            let url = "/api/register";
            let data = {username:username,password:password,key:this.key}
            let response = await axios.post(url,data);
            if(response.data){
                this.login()
            }else{
                this.$message.error('注册失败');
            }
            return response.data;
        },
        async getnamesake(name){
            let url = "/api/namesake";
            let response = await axios.get(url, {
            params: {
                username: name,
                }
            });
            return response.data;
        },
        changeregister(){
            this.register = !this.register;
            this.form = {
                username: "",
                password: "",
                confirmword: "",
            }
        },
        submitForm() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    if(this.register){
                        this.toregister();
                    }else{
                        this.login();
                    }
                }else {
                    this.$message.error('请正确补完输入数据');
                    return false;
                }
            });
        },
        async getkey(){
            let data = await axios.get("/api/getkey", {params: {}})
            if(data.data){
                this.key = data.data;
            }else{
                this.$message.error('获取公钥失败');
            }
        },
    },
    created(){
    },
    activated(){
        this.getkey()
    }
}
</script>
<style>
</style>

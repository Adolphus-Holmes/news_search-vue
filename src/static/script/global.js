import axios from 'axios';
import _this from '../../main.js'
let base={};
base.install = function(Vue){
    Vue.prototype.$scrollTo = (x = 0, y = 0, type = 'smooth') => {
        window.scrollTo({
            top: x,
            left: y,
            behavior: type // 滚动行为：smooth平滑滚动，instant瞬间滚动，默认值auto，等同于instant
        })
    }
    Vue.prototype.assert = function assert(condition, msg){
        if (!condition) throw new Error(`[vuex] ${msg}`)
    };
    Vue.prototype.status_deal_with = function status_deal_with(status_code){
        switch(status_code){
            case 401:
                alert("登录已过期")
                _this.handleCommand("logout")
                return false;
            case 449:
                _this.$message('秘钥已过期，请重试');
                _this.getkey();
                return false;
        }
        return true;
    };
    Vue.prototype.handleCommand = function handleCommand(command){
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
            _this.$router.push('/center');
        }
        if(command == 'logout'){
            if(_this.$cookies.isKey('XSRF-TOKEN')){
                _this.logout.then((data)=>{
                    if(data){
                        _this.$cookies.remove('XSRF-TOKEN');
                        location.reload();
                    }else{
                        _this.$message.error('操作出错');
                    }
                }
                )
            }
        }
    };
    Vue.prototype.getkey = async function getkey(){
        let data = await axios.get("/api/getkey", {params: {}})
        if(data.data){
            _this.key = data.data;
        }else{
            _this.$message.error('获取秘钥出错');
        }
    }
};
export default base;
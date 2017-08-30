import request from 'superagent'

import loginBox from '../../components/loginBox.vue'
import loginCard from '../../components/loginCard.vue'



const state = {
    TitleList: [],
    userInfor: {}, //save user login infor
    merchants: [], //save 组织列表
    loginCard: false,
    loginBox: true,
    CardBox: loginCard
}

const mutations = {
    addTab(state, targetName) {
        // console.log(targetName);
        let obj = {};
        obj.title = targetName.title;
        obj.path = targetName.url;
        obj.name = targetName.name;
        if (state.TitleList) {
            // alert(1);
            for (let i = 0; i < state.TitleList.length; i++) {
                if (state.TitleList[i].name == targetName.name) {
                    return;
                }
            }
        }
        state.TitleList.push(obj);
        // console.log(state.TitleList);
        window.sessionStorage.setItem('key', JSON.stringify(state.TitleList));
    },
    deleTab(state, obj) {
        // console.log(obj);
        state.TitleList.splice(obj.index, 1);
        window.sessionStorage.setItem('key', JSON.stringify(state.TitleList));
        if (obj.index == 0) {
            obj.self.$router.push({
                name: 'homeContent'
            });
            return;
        }
        // obj.self.$router.push({ name: state.TitleList[obj.index - 1].name });
        // console.log(state.TitleList[obj.index - 1].name);
        // console.log(state.TitleList);

        obj.self.$router.push({
            path: state.TitleList[obj.index - 1].path
        });

    },
    changeData(state, data) { //操作异步方法改变state
        state.userInfor = data;
    },
    changeLogo(state,data){
        state.merchants = data;
    },
    goBack(state) {
        // alert(1);
        // this.$store.state.merchants = [];
        // $event.stopPropagation();
        // $event.preventDefault();
        state.CardBox = loginCard;
        // state.loginBox = loginBox;;
    },
}

const actions = {
    loginAPI({
        commit,
        state
    }, userPwd) { //send login API
        // console.log(userPwd);
        userPwd.self.$http.post('api/user/login', {
                // number: userPwd.name,
                // pass: userPwd.pwd
                number: "xiaowen",
                pass: "e10adc3949ba59abbe56e057f20f883e"
            })
            .then(data => {
                if (data.data.status == '156') {
                    //用户名或密码不正确
                    // alert('用户名或密码不正确');

                    console.log('用户名或密码不正确');
                    console.log(data.data);
                    return;
                } else if (data.data.status == '200') { //登录成功
                    // alert('success');
                    commit('changeLogo', data.data.result.merchants);
                    state.userInfor = data.data.result.userInfo;
                    // state.merchants = data.data.result.merchants;
                    // state.merchants.forEach(function (item) {
                    //     let obj = {};
                    //     obj.logo = item.logo;
                    //     obj.merchant_name = item.merchant_name;
                    //     state.logo.push(obj);
                    // });
                    console.log(state.merchants);
                    // console.log(state.userInfor);
                    // console.log(state.merchants);
                    if (data.data.result.userInfo.isMerchant == '1') { //有组织
                        state.loginCard = true;
                        state.loginBox = false;
                        console.log(state.loginCard);
                    } else if (data.data.result.userInfo.isMerchant == '0') { //无组织
                        state.loginCard = false;
                        state.loginBox = true;
                        userPwd.self.$router.push({
                            name: 'homeContent'
                        });
                    }
                    // console.log(data.data.result.userInfo.isMerchant);
                    // commit('changeData', data.data);
                    // userPwd.self.$router.push({
                    //     name: 'homeContent'
                    // });
                }
                // console.log(data.data);
            })
            .catch(error => {
                // alert(error);
                console.log(error);
            })
    }
}





export default {
    state,
    mutations,
    actions
}

<template>
    <div class="preProjectMessage">
        <div class="title">
            <div class="left">
                <span class="desc">{{title}}</span>
            </div>
            <div class="right">
                <el-button type="danger" :disabled="nextStageDisabled" @click="changeStep">下一阶段</el-button>
                <el-button type="danger" :class="{bgc:suspend}" :disabled="suspend" @click="deleteReminders=true">中止
                </el-button>
            </div>
        </div>
        <div class="step">
            <div v-for="(item,index) in stepLists" :key="item.index" class="step_span" :class="{'step_span_change  step_first step_first_change':(index==0)&&(item.id == stageId),
                                                         'step_first':index==0 ,'step_span_change step_second step_second_change':(index!=0)&&(index!=stepLists.length-1)&&(item.id == stageId),
                                                         'step_second':(index!=0)&&(index!=stepLists.length-1),'step_span_change step_third step_third_change':index==(stepLists.length-1)&&(item.id == stageId),
                                                         'step_third':index==(stepLists.length-1)}">
                <span>{{item.stageName}}</span>
            </div>
        </div>
        <div class="picture">
            <div class="img_wrapper">
                <img src="/static/img/double.png">
            </div>
            <!-- 小双助手 -->
            <div class="prompt_message">
                <span class="prompt">{{prompt}}</span>
                <div class="item_wrapper">
                    <div class="item" v-for="(item,index) in module" :key="item.index">
                        <span class="count">{{index +1}}</span>
                        <p class="desc" v-if="item.type == 1">{{item.title}}</p>
                        <p class="desc" v-if="item.type == 2">{{item.title}}</p>
                        <p class="desc" v-if="item.type == 3">{{item.title}}</p>
                        <span v-if="item.status == 1" class="state">已完成</span>
                        <!-- 立即上传 -->
                        <div v-if="item.type == 1 && item.status == 0" style="float: left;position:relative;">
                            <el-button type="text" style="color:#f05e5e">立即上传</el-button>
                            <input type="file" class="fileInput" @change="changeFile($event, item.id)" ref="avatarInput">
                        </div>
                        <!-- 发起申请 -->
                        <el-button v-if="item.type == 2" type="text" class="state" @click="openDialog(1, item.id)">立即审批</el-button>
                        <!-- 查看进度 -->
                        <el-button v-if="item.type == 3" type="text" class="state" @click="openDialog(2, item.id)">查看进度</el-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="tabs">
            <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
                <el-tab-pane v-if="checkProjectAuth('XM-xiangqing')" label="详情" name="details" class="tab_list">
                    <detail-form :tabs="tabs" :proId="projectId" :basicForm="basicForm" :companyForm="companyForm" :capitalForm="capitalForm">
                    </detail-form>
                    <table-form :tabs="tabs" :companyForm="companyForm" :memberData="memberData" :structureData="structureData"></table-form>
                </el-tab-pane>
                <el-tab-pane v-if="checkProjectAuth('XMTD')" label="团队" name="team" class="tab_list">
                    <team-table :tabs="tabs" :proId="projectId" :proUsers="proUsers" :proRoles="proRoles">
                    </team-table>
                </el-tab-pane>
                <el-tab-pane v-if="checkProjectAuth('XM-jilu')" label="记录" name="record" class="tab_list">
                    <record-form :tabs="tabs" :proId="projectId"></record-form>
                </el-tab-pane>
                <el-tab-pane v-if="checkProjectAuth('XM-shenpi')" label="审批" name="approve" class="tab_list">
                    <approve-table :tabs="tabs" :projectId="projectId"></approve-table>
                </el-tab-pane>
                <el-tab-pane v-if="checkProjectAuth('XM-wendang')" label="文档" name="file" class="tab_list">
                    <file-table :tabs="tabs" :uploaded="uploaded" v-on:listenUploaded="listenUploaded" :proId="projectId"></file-table>
                </el-tab-pane>
                <el-tab-pane v-if="checkProjectAuth('XM-fengxianguanli')" label="风险登记" name="risk" class="tab_list">
                    <risk-table :tabs="tabs" :proId="projectId" :proUsers="proUsers"></risk-table>
                </el-tab-pane>
                <el-tab-pane v-if="checkProjectAuth('XM-guanli') && (isManage || isExit)" label="管理" name="manage" class="tab_list">
                    <manage-table :tabs="tabs" :proId="projectId"></manage-table>
                </el-tab-pane>
                <el-tab-pane v-if="checkProjectAuth('GL-XMTC') && isExit" label="退出" name="outing" class="tab_list">
                    <outing-form :tabs="tabs" :proId="projectId"></outing-form>
                </el-tab-pane>
            </el-tabs>
        </div>
        <!-- 中止确认弹框 -->
        <delete-reminders :deleteReminders="deleteReminders" :modal_loading="modal_loading" :message_title="message_title" :message="message" :btnText="btnText" @del="jumpPool" @cancel="deleteReminders=false">
        </delete-reminders>
        <!-- 发起申请 对话框-->
        <apply-forms :applyModal="applyModal" :applyForm="applyForm" :auditorOptions="auditorOptions" @submit="submitApply" @cancle="cancleApply"></apply-forms>
        <!-- 查看进度 对话框 -->
        <progress-forms :progressModal="progressModal" :dialogTitle="dialogTitle" :isBlock="isBlock" :documentInfo="documentInfo" :table2="progressTable" :approvalForm="approvalForm" :auditorOptions="auditorOptions" @submit="submitApproval" @cancle="cancleApproval"></progress-forms>
    </div>
</template>

<script type="text/javascript">
import detailForm from './details'
import tableForm from './tables'
import teamTable from './team'
// import industryForm from './industry'
import recordForm from './record'
import approveTable from './approve'
import fileTable from './file'
import riskTable from './risk'
import manageTable from './manage'
import outingForm from './outing'
import Loading from 'element-ui'
import deleteReminders from 'components/deleteReminders'
import applyForms from 'components/applyDialog'
import progressForms from 'components/progressDialog'
import {checkProjectAuth } from 'common/js/config'
import {
    getPreDetail,
    slectAllStage,
    getStageUploadDocument,
    nextStage,
    suspendInvestProject,
    getTeamListPage,
    startApproveInfo,
    getApproveInfo,
    approveResult
} from 'api/projectPre';
import {
    getProjectUsers
} from 'api/projectSys';
import {
    queryList
} from 'api/fund'

const PROJECT_TYPE = 0; // 项目角色列表参数: 0，是项目角色 1是基金角色

export default {
    name: 'preProjectMessage',
    data() {
        return {
            userId: '',
            file: '',
            stepLists: [],
            projectId: '',
            investProjectId: '',
            stageId: '',
            isExit: false,
            isManage: false,
            deleteReminders: false,
            message_title: '确认中止',
            message: '是否确认中止该项目？',
            btnText: '中止',
            modal_loading: false,
            suspend: false,
            applyModal: false,
            progressModal: false,
            title: '',
            prompt: '任务助手小双温馨提示:',
            isBlock: false,
            dialogTitle: '查看进度',
            activeName: 'details',
            proUsers: [], // 项目用户列表
            proRoles: [], // 项目角色列表
            module: [],     // 该项目当前阶段需要完成的任务
            basicForm: {}, // 基本信息
            companyForm: {}, // 企业信息
            memberData: [], // 董事会成员
            structureData: [], // 股权结构
            uploaded: false,
            tabs: {
                tabList: [true, false, false, false, false, false, false, false]
            },
            capitalForm: {
                startInvestDate: '',
                exitDate: ''
            }, // 投资信息
            nextStageDisabled: false,
            industryForm: {
                baseInfo: '工商信息',
                flag: true
            },
            applyForm: { // 发起申请对话框 表单
                currentStageId: '',
                roleId: '',
                approveTitle: '',
                approveUserId: '',
                orderValue: '',
                remark: ''
            },
            auditorOptions: [{ //发起申请对话框 审批人列表
                userId: '选项1',
                userName: '张三'
            }, {
                userId: '选项2',
                userName: '李四'
            }, {
                userId: '选项3',
                userName: '王二'
            }],
            documentInfo: {
                progressName: 'AAA项目XX申请',
                appendixList: [{
                    fileName: '调研报告1',
                    url: ''
                },
                {
                    fileName: '调研报告2',
                    url: ''
                }]
            },
            progressTable: [ //查看进度对话框 节点table
                {
                    node: '发起人',
                    operator: '杨军',
                    startingTime: '2017-10-30 16:25:14',
                    conclusion: '同意',
                    notes: '意见备注意见备注意见备注意见备注意见备注意见备注意见备注意见备注意见备注意见备注意见备注意见备注'
                }
            ],
            //审批对话框  审批意见表单
            approvalForm: {
                radio: '1',
                auditor: '',
                approvalNotes: ''
            }
        }
    },
    components: {
        deleteReminders,
        detailForm,
        tableForm,
        teamTable,
        // industryForm,
        recordForm,
        approveTable,
        fileTable,
        riskTable,
        manageTable,
        outingForm,
        applyForms,
        progressForms
    },
    created() {
        this.investProjectId = this.$route.params.investProjectId;
        this.projectId = this.$route.params.userId;
        this.init();
    },
    watch: {
        '$route'(to, from) {
            this.investProjectId = this.$route.params.investProjectId;
            this.projectId = this.$route.params.userId;
            if (to.name == 'preProjectMessage') {
                this.init();      //再次调起我要执行的函数
            }
        }
    },
    methods: {
        checkProjectAuth(code){
            return checkProjectAuth(code);
        },
        listenUploaded(uploaded) {
            if (uploaded) {
                this.getStageUploadDocument(); //获取当前阶段及任务小助
            }
        },
        init() {
            this.initInfo();
            this.getPreProDetail();
            this.getStageUploadDocument(); //获取当前阶段及任务小助
            this.slectAllStage();
        },
        handleClick(val) {
            let idx = val.index;
            let _tabList = this.tabs.tabList;
            if (!_tabList[idx]) {
                for (var i = 0; i < _tabList.length; i++) {
                    if (i == idx) {
                        _tabList[i] = true;
                    } else {
                        _tabList[i] = false;
                    }
                }
                let _tabs = { tabList: _tabList }
                this.tabs = _tabs;
            }
        },
        initInfo() {
            let merchants = JSON.parse(window.sessionStorage.getItem('merchants') || '[]');
            this.merchantId = merchants[0].id;
            this.getProUsers(), this.getProRoles();
        },
        slectAllStage() {
            slectAllStage().then(resp => {
                this.stepLists = resp.data.result || [];
                this.projectStage();
            }).catch(e => {
                console.log('slectAllStage() exists error: ', e);
            });
        },
        //控制当前阶段
        projectStage() {
            // console.log("当前阶段："+this.stageId);
            if (this.stageId == undefined || this.stageId == '') return;
            let isExit = this.isExit, isManage = this.isManage;
            let stageId = this.stageId;
            //退出阶段，下一阶段按钮不可用
            let nextStageDisabled = this.nextStageDisabled;
            this.stepLists.forEach(function(item, index) {
                if (item.id == stageId && item.stageKey == 3) {
                    nextStageDisabled = true;
                    // console.log("退出阶段, 显示管理、退出标签");
                    isExit = true;
                }
                if (item.id == stageId && item.stageKey == 2) {
                    // console.log("管理阶段，显示管理标签");
                    isManage = true;
                }
            });
            if (isExit || isManage) {
                this.suspend = true;
            }
            this.isExit = isExit;
            this.isManage = isManage;
            this.nextStageDisabled = nextStageDisabled;

            if(this.nextStageDisabled){
                let _hasApprove = false;
                this.module.forEach((item)=>{
                    if(item.type == 2 || item.type == 3){
                        _hasApprove = true;
                        return ;
                    }
                });
                this.nextStageDisabled = this.nextStageDisabled || _hasApprove;
            }
        },
        /**
         * [getPreProDetail 项目详情]
         * @return {[type]} [description]
         */
        getPreProDetail() {
            getPreDetail(this.projectId).then(resp => {
                if (resp.data.result.enterpriseInfo == null) {
                    // console.log('项目详情-企业信息为空 result: '+JSON.stringify(resp.data.result));
                    console.log('项目详情-企业信息为空');
                    this.companyForm = {
                        flag: true
                    };
                } else {
                    this.companyForm = Object.assign({}, {
                        flag: true
                    }, resp.data.result.enterpriseInfo);
                }

                this.basicForm = Object.assign({}, {
                    flag: true
                }, resp.data.result.projectInfo);

                this.capitalForm = Object.assign({}, {
                    flag: true
                }, resp.data.result.projectInvestmentInfo);
                this.memberData = resp.data.result.listBoardMember;
                this.structureData = resp.data.result.listOwnershipStructure;
                this.title = resp.data.result.projectInfo.projectName;

            }).catch(e => {
                console.log('获取项目详情出错: ', e);
            });
            // getStageUploadDocument()
        },
        getStageUploadDocument() {
            let typeId = this.projectId;
            let investProjectId = this.investProjectId;
            let params = { typeId, investProjectId };
            getStageUploadDocument(params).then(resp => {
                this.stageId = resp.data.stageId;
                this.module = resp.data.result;

                this.projectStage();
            }).catch(e => {
                console.log('getStageUploadDocument() exists error: ', e);
            });
        },
        /**
         * [getProUsers 获取项目用户列表]
         * @return {[type]} [description]
         */
        getProUsers() {
            getProjectUsers({
                merchantId: this.merchantId
            }).then(resp => {
                let data = resp.data;
                if (data.status == '200') {
                    this.proUsers = data.result;
                }
            }).catch(e => {
                console.log('getProjectUsers() exists error: ', e);
            });
        },
        /**
         * [getProRoles 获取项目角色列表]
         * @return {[type]} [description]
         */
        getProRoles() {
            queryList(PROJECT_TYPE).then(resp => {
                let data = resp.data;
                if (data.status == '200') {
                    this.proRoles = data.result;
                }
            }).catch(e => {
                console.log('获取项目角色列表 error: ', e);
            });
        },
        // 转至下一阶段 的方法
        changeStep() {
            let typeId = this.projectId, investProjectId = this.investProjectId, stageId = this.stageId;
            let params = {
                typeId,
                investProjectId,
                stageId
            };
            nextStage(params).then(resp => {
                if (resp.data.status == "200") {
                    console.log("200");
                    this.getStageUploadDocument();
                }else if(resp.data.status == "9030"){
                    console.log("9030");
                    this.applyModal = true;
                    //发起申请
                    this.$set(this.$data, 'applyForm', resp.data.result);
                    let roleId = resp.data.result.roleId;
                    let params = {roleId: roleId, investProjectId: this.investProjectId};
                    this.getAuditorOptions(params);

                } else {
                    this.$Message.error(resp.data.message);
                }

            }).catch(e => {
                console.log('changeStep() exists error: ', e);
            });
        },
        getAuditorOptions(params){
            getTeamListPage(params).then(resp => {
                let data = resp.data;
                if (data.status == '200') {
                    this.auditorOptions = data.result.list;
                }else{
                    this.auditorOptions = [];
                }
            }).catch(e => {
                console.log('获取项目角色列表 error: ', e);
            });
        },
        disable(name) {
            if (name.flag === false) {
                return name.flag = true
            } else {
                return name.flag = false
            }
        },
        // 设置table间隔行的background-color
        tableRowClassName(row, index) {
            if ((index % 2) == 0) {
                return 'info-row';
            } else {
                return 'positive-row';
            }
            return '';
        },
        //中止项目
        jumpPool() {
            // console.log("investProjectId" + this.investProjectId);
            suspendInvestProject(this.investProjectId).then(resp => {
                if (resp.data.status === "200") {
                    this.deleteReminders = !this.deleteReminders;
                    this.addTab('项目池', '/home/projectPool', 'projectPool');
                    this.$router.push({ name: 'projectPool' });
                } else {
                    reject(data.message);
                    this.deleteReminders = !this.deleteReminders;
                }
            }).catch(e => {
                console.log('中止项目 error: ', e);
            });

        },
        addTab(th, url, name) {
            this.$store.commit({
                type: 'addTab',
                title: th,
                url: url,
                name: name
            });
        },
        changeFile(event, fileId) { //上传文件input
            this.file = event.target.files[0];
            let userId = JSON.parse(sessionStorage.getItem('userInfor')).id;
            event.preventDefault();
            let formData = new FormData();
            formData.append('file', this.file);
            formData.append('stageId', this.stageId);
            formData.append('userId', userId);
            formData.append('type', 3);
            formData.append('uploadTypeId', this.projectId);
            formData.append('fileId', fileId);
            let config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };
            this.$http.post(this.api + '/files/uploadProjectDocument', formData, config)
                .then((res) => {
                    // console.log("上传文件结果:"+ JSON.stringify(res.data));
                    if (res.status == '200') {
                        if (res.data.status == '200') {
                            this.getStageUploadDocument();
                            this.uploaded = true;
                        } else {
                            this.$Message.error(res.data.message);
                            //loadingInstance.close();  
                        }
                    }
                })
                .catch(e => {
                    this.$Message.error("上传错误");
                    console.log('上传错误: ', e);
                    // loadingInstance.close();
                })
        },
        // 发起申请表单
        submitApply(applyForm) {
            this.applyModal = false;
            startApproveInfo(applyForm).then(resp => {
                if (resp.data.status === "200") {
                    this.getStageUploadDocument();
                }else {
                    this.$Message.error(resp.data.message);
                }
            }).catch(e => {
                console.log('changeStep() exists error: ', e);
            });
        },
        cancleApply() {
            this.applyModal = false;
        },
        // 小双助手 打开不同的对话框
        openDialog(index, id) {
            getApproveInfo(id).then(resp => {
                if (resp.data.status === "200") {
                    console.log("审批详情："+JSON.stringify(resp.data.result));
                    //this.getStageUploadDocument();
                    this.documentInfo = resp.data.result.dataDocumentResult;
                    this.progressTable = resp.data.result.approveStageNodeData;
                    this.approvalForm = resp.data.result;
                    this.$set(this.$data.approvalForm, 'disposeResult', "1"); //默认同意
                    this.$set(this.$data.approvalForm, 'approveUserId', ""); //默认为空
                    this.$set(this.$data.approvalForm, 'remark', ""); //默认为空
                    if(resp.data.result.roleId != null && resp.data.result.roleId != ''){
                        let roleId = resp.data.result.roleId;
                        let params = {roleId: roleId, investProjectId: this.investProjectId};
                        this.getAuditorOptions(params);
                    }

                    this.progressModal = true;
                    if (index == 1) {
                        this.isBlock = true;
                        this.dialogTitle = '审批';
                    } else if (index == 2) {
                        this.isBlock = false;
                    }
                }else {
                    this.$Message.error(resp.data.message);
                }
            }).catch(e => {
                console.log('openDialog() exists error: ', e);
            });

        },
        // 审批表单
        submitApproval(approvalForm) {
            approveResult(approvalForm, this.stageId, this.projectId).then(resp => {
                if (resp.data.status === "200") {
                    console.log("审批详情："+JSON.stringify(resp.data.result));
                    this.progressModal = false;
                    this.getStageUploadDocument();
                }else {
                    this.$Message.error(res.data.message);
                }
            }).catch(e => {
                console.log('openDialog() exists error: ', e);
            });
        },
        cancleApproval() {
            this.progressModal = false;
        }
    }
}
</script>


<style lang="less" scoped>
.preProjectMessage {
    width: 100%;
    min-height: 100%;
    background-color: #fff;
    padding: 24px;
    .title {
        width: 100%;
        height: 64px;
        line-height: 64px;
        background-color: #2a3142;
        .left {
            height: 100%;
            float: left;
            margin-left: 24px;
            font-size: 0;
            .desc {
                font-size: 20px;
                font-weight: 600;
                color: #fff;
                vertical-align: top;
            }
        }
        .right {
            height: 100%;
            float: right;
            margin-right: 24px;
            .el-button {
                padding: 5px 15px;
            }
        }
        .bgc {
            background: #a0a3aa;
            border: 1px solid #a0a3aa;
        }
    }
    .step {
        width: 100%;
        height: 52px;
        margin-top: 24px;
        .step_span {
            line-height: 52px;
            text-align: center;
            width: 14%;
            height: 52px;
            float: left;
            border: 1px solid #000;
            position: relative;
        }
        .step_span_change {
            border: 1px solid #f05e5e;
        }
        .step_first {
            color: #000;
            border: 1px solid #000;
            &::after {
                content: '';
                width: 36px;
                height: 36px;
                background: #FFF;
                position: absolute;
                top: 7px;
                right: -19px;
                border: 1px solid;
                border-color: #000 #000 transparent transparent;
                transform: rotate(45deg);
                z-index: 1;
            }
        }
        .step_first_change {
            color: #f05e5e;
            border: 1px solid #f05e5e;
            &::after {
                border-color: #f05e5e #f05e5e transparent transparent;
            }
        }
        .step_second {
            margin-left: 3.2%;
            padding-left: 2%;
            &::after {
                content: '';
                width: 36px;
                height: 36px;
                background: #FFF;
                position: absolute;
                top: 7px;
                right: -19px;
                border: 1px solid;
                border-color: #000 #000 transparent transparent;
                transform: rotate(45deg);
                z-index: 1;
            }
            &::before {
                content: '';
                width: 36px;
                height: 36px;
                background: #FFF;
                position: absolute;
                top: 7px;
                left: -19px;
                border: 1px solid;
                border-color: #000 #000 transparent transparent;
                transform: rotate(45deg);
            }
        }
        .step_second_change {
            color: #f05e5e;
            &::after {
                border-color: #f05e5e #f05e5e transparent transparent;
            }
            &::before {
                border-color: #f05e5e #f05e5e transparent transparent;
            }
        }
        .step_third {
            margin-left: 3%;
            &::before {
                content: '';
                width: 36px;
                height: 36px;
                background: #FFF;
                position: absolute;
                top: 7px;
                left: -19px;
                border: 1px solid;
                border-color: #000 #000 transparent transparent;
                transform: rotate(45deg);
            }
        }
        .step_third_change {
            color: #f05e5e;
            &::before {
                border-color: #f05e5e #f05e5e transparent transparent;
            }
        }
    }
    .picture {
        width: 100%;
        text-align: center;
        padding: 54px 0;
        .img_wrapper {
            height: 100%;
            margin-right: 34px;
            display: inline-block;
            vertical-align: middle;
        }
        .fileInput {
            opacity: 0;
            position: absolute;
            left: 0px;
            top: 0px;
            width: 80px;
            height: 25px;
            line-height: 25px;
        }
        .prompt_message {
            width: 48%; // height: 140px;
            display: inline-block;
            vertical-align: middle;
            background: #eef0f4;
            padding: 18px 24px;
            text-align: left;
            border-radius: 10px;
            position: relative;
            &::before {
                content: '';
                width: 0;
                height: 0;
                border-bottom: 20px solid #eef0f4;
                border-left: 20px solid transparent;
                position: absolute;
                top: 40px;
                left: -19px;
            }
            .prompt {
                line-height: 36px;
            }
            .item {
                width: 100%;
                height: 36px;
                margin-left: 24px;
                line-height: 36px;
                overflow: auto;
                .count,
                .desc,
                .state {
                    float: left; // line-height: 36px;
                }
                .count {
                    width: 20px;
                    height: 20px;
                    line-height: 20px;
                    border-radius: 100%;
                    color: #fff;
                    background: #f05e5e;
                    text-align: center;
                    margin-top: 8px;
                }
                .desc {
                    margin: 0 24px 0 20px;
                }
                .state {
                    color: #f05e5e;
                }
                .complete {
                    color: #a0a3aa;
                }
            }
        }
    }
    .comment_box {
        height: 80px;
        display: flex;
        align-items: center;
        padding-left: 90px;
        .comment_left {
            width: 100px;
            margin-right: 150px;
            text-align: center;
        }
        .comment_right {
            display: flex;
            flex-direction: column;
        }
    }
    .bgh {
        background: #fff;
    }
    .bgl {
        background: #EEF0F4;
    }
    .tabs {
        width: 100%;
        padding-bottom: 54px;
        .el-tabs__nav {
            width: 100% !important;
            .el-tabs__item {
                width: 12.5% !important;
            }
        }
    }
}
</style>

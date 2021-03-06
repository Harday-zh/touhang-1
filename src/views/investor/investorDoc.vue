<template>
<div class="file">
    <el-row class="file_wrapper">
        <el-col :span="24">
            <div class="listHeader">
                <div class="list" v-for="(list, index) of listHeader">{{list}}</div>
            </div>
        </el-col>
        <el-col :span="24" v-for="(file, index) of investmentData" :key="index">
            <div class="title">
                <div class="left">{{file.title}}</div>
                <div class="right"></div>
            </div>
            <el-table :data="file.dataDocumentResult" border :show-header="false" style="width: 100%">
                <el-table-column label="基金阶段" prop="allocationDocumentName">
                </el-table-column>
                <el-table-column label="文档名称" prop="documentName">
                </el-table-column>
                <el-table-column label="上传人" prop="uploadUser">
                </el-table-column>
                <el-table-column label="上传日期" prop="createDate">
                </el-table-column>
                <el-table-column label="操作">
                    <template scope="scope">
                        <el-button type="text"
                                size="small"
                                class="scopeBtn"
                                v-show="!scope.row.id"
                                @click="uploadInvestorDoc(scope.$index, scope.row)">
                                上传
                        </el-button>
                        <el-button type="text"
                                   size="small"
                                   v-show="scope.row.id"
                                   class="scopeBtn"
                                   @click="downloadInvestorDoc(scope.$index, scope.row)">
                                   下载
                        </el-button>
                        <el-button type="text"
                                   size="small"
                                   class="btn_border scopeBtn" @click="previewInvestorDoc(scope.$index, scope.row)">
                                   预览
                        </el-button>
                        <el-button type="text"
                                   size="small"
                                   class="scopeBtn" @click="deleteInvestorDoc(scope.$index, scope.row)">
                                   删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
    <!-- 上传基金设立报表-->
    <Modal v-model="modalAdd" title="基金设立报告" :mask-closable="false">
        <Upload ref="upload" multiple type="drag" :action="actionUrl" :data="uploadInfo" :on-success="handleSuccess" v-show="upload">
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>点击或将文件拖拽到这里上传</p>
            </div>
        </Upload>
        <div style="text-align:center;" v-show="preview">
            {{previewFundInfo}}
            <img :src="previewFundInfo" alt="" style="width: 50%; height: auto;">
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="modalAdd = false">取 消</el-button>
        </div>
    </Modal>
    <!-- 删除确认模态框 -->
    <delete-reminders @cancel="confirmCancel" @del="confirmDel" :modal_loading="modal_loading" :deleteReminders="reminders">
    </delete-reminders>
</div>
</template>

<script type="text/ecmascript-6">
import {API_ROOT} from '../../config'
import deleteReminders from 'components/deleteReminders'
import {deleteDocument, selectProjectOrFundDocument} from 'api/fund'
export default {
    props: {
        investmentData: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            listHeader: ['投资者文档', '文档名称', '上传人', '上传日期', '操作'],
            modalAdd: false,
            file: null, // 上传
            actionUrl: API_ROOT + '/files/uploadProjectDocument',
            uploadInfo: {
                file: '',
                stageId: '',
                uploadTypeId: this.$route.params.userId,
                fileId: '',
                type: 2,
                userId: JSON.parse(sessionStorage.getItem('userInfor')).id
            },
            deleteId: '',
            upload: false, // 上传
            preview: false, // 预览
            reminders: false, // 确认删除模态框
        }
    },
    methods: {
        uploadInvestorDoc(index, row) { // 上传投资者文档
            this.modalAdd = true
            this.upload = true
            this.uploadInfo.stageId = row.stageId
            this.uploadInfo.fileId = row.fileId
        },
        deleteInvestorDoc(index, row) { // 删除投资者文档
            this.reminders = true
            this.deleteId = row.id
        },
        previewInvestorDoc(index, row) { // 预览投资者文档
            this.modalAdd = true
            this.preview = true
            this.previewFundInfo = row.documentUrl.split('?')[0]
        },
        downloadInvestorDoc(index, row) {
            console.log(row)
            window.open(row.documentUrl, '_blank')
        },
        handleSuccess(res, file) {
            if(res.status == '200') {
                this.$Message.success(res.message || '上传成功！')
                this.modalAdd = false
                this._getInvestDoc()
            }
        },
        confirmDel() {
            console.log(this.deleteId)
            if (this.deleteId == '') {
                this.$Message.info('请上传文档！')
                this.reminders = false
            } else {
                deleteDocument(this.deleteId).then((res) => {
                    if (res.status == '200') {
                        this.$Message.success(res.data.message || '删除成功！')
                        this.reminders = false
                        this._getInvestDoc()
                    }
                }).catch(err => {
                    this.$Message.success(err.data.message || '删除失败！')
                    this.reminders = false
                })
            }
        },
        confirmCancel() {
            this.reminders = false
        },
        _getInvestDoc() {
            selectProjectOrFundDocument(this.$route.params.userId, 3).then((res) => {
                if (res.status == '200') {
                    this.investmentData = res.data.result
                }
            })
        }
    },
    components: {
        deleteReminders
    }
}
</script>

<style lang="less" scoped>
@import "../../common/styles/variable.less";
.file {
    width: 100%;
    height: 100%;
    .listHeader {
        width: 100%;
        height: 42px;
        display: flex;
        .list {
            flex: 1;
            color: @color-base;
            font-size: 16px;
            text-align: center;
            line-height: 42px;
            background: @color-theme;
        }
    }
    .el-table {
        .border-right,
        .scopeBtn {
            padding: 0 12px;
            margin-left: 0;
            border-radius: 0;
        }
        .btn_border {
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
        }
    }
    .title {
        width: 100%;
        height: 42px;
        padding-right: 24px;
        padding-left: 24px;
        background-color: #eef1f6;
        .left,
        .right {
            flex: 1;
            color: #1f2d3d;
            font-weight: blod;
            line-height: 42px;
        }
    }
}
</style>

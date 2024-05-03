"use strict";

import PageBase from "./PageBase.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle("UserRegister - confirm");
        this.labelButtonResist = "登録する";
        this.labelButtonReset = "修正する";
        this.textConfirm = "下記の内容で登録します";
    }

    async renderHtml() {
        return `
            <form class="formUserResister blockForm" action="" method="post">
                <p>${this.textConfirm}</p>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="">name</label></dt>
                    <dd class="unitFormInput_input unitFormInput_input-confirm">namae</dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="">email</label></dt>
                    <dd class="unitFormInput_input unitFormInput_input-confirm">aaa@email.com</dd>
                </dl>
                <dl class="unitFormInput">
                    <dt class="unitFormInput_label"><label for="">password</label></dt>
                    <dd class="unitFormInput_input unitFormInput_input-confirm">**********</dd>
                </dl>
                <ul class="listButton">
                    <li><button type="reset" class="formUserResister_button unitButton">${this.labelButtonReset}</button></li>
                    <li><button type="submit" class="formUserResister_button unitButton">${this.labelButtonResist}</button></li>
                </ul>
            </form>
        `;
    }
}
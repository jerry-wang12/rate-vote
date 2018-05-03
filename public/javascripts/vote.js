$(function () {
    // 获取当前cookie
    var UUID = getUUID();

    $.fn.raty.defaults.path = '/images';

    $('.rate').raty({
        number: 10
    });
    // 接口查询当前评分
    ajaxHelper('GET', '/vote/index/average', null, (res) => {
        $('.rate-count').text(res.total);
        $('.rate-average').raty({
            number: 10,
            readOnly: true,
            half: true,
            score: res.averageRate
        });
    })
    ajaxHelper('GET', '/vote/index/data/?' + $.param({ "id": UUID }), null, (res) => {
        if (res.msg === 'success') {
            $('.rate').raty({
                number: 10,
                readOnly: true,
                score: res.data.rate
            });
            $('[name=comments]').text(res.data.comments).attr('readonly', 'readonly');
            $('.js-submit').hide();
        }
    })
    // 获取用户评分、comments并提交
    $('.js-submit').on('click', (e) => {
        let reqData = {
            "id": UUID,
            "comments": $('[name=comments]').val(),
            "rate": $('.rate').raty('score')
        };
        if (reqData.rate < 1 || reqData.comments.length == 0) {
            alert("请评价后再提交");
            return false;
        }
        ajaxHelper('POST', '/vote/index/rate', reqData, (res) => {
            window.alert(res.msg);
            // 刷新页面
            location.reload();
        })
    });

    function getUUID() {
        var uuid = getCookie("UUID");
        if (!uuid) {
            uuid = (Math.random() + "").substr(2, 8)
            setCookie("UUID", uuid, 30);
        }
        return uuid;
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
        }
        return "";
    }

    function ajaxHelper(type, url, data, succHandler, isAsync) {
        $.ajax({
            type: type,
            url: url,
            contentType: "application/json",
            data: data ? JSON.stringify(data) : null,
            async: (isAsync !== false),
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: (retData) => {
                if (succHandler && $.isFunction(succHandler)) {
                    succHandler(JSON.parse(retData));
                }
            },
            error: (e) => {
                console.log(e);
                window.alert(e.responseText);
            }
        });
    }
})
﻿/**
Провайдер AnyBalance (http://any-balance-providers.googlecode.com)
*/

var g_headers = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Accept-Charset': 'windows-1251,utf-8;q=0.7,*;q=0.3',
	'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
	'Connection': 'keep-alive',
	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.76 Safari/537.36',
};

function main() {
	var prefs = AnyBalance.getPreferences();
	var baseurl = 'http://www.berlio.by/';
	AnyBalance.setDefaultCharset('windows-1251');
	
	checkEmpty(prefs.login, 'Введите логин!');
	checkEmpty(prefs.password, 'Введите пароль!');
	
	var html = AnyBalance.requestGet(baseurl + 'enter.php', g_headers);
	
	html = AnyBalance.requestPost(baseurl + 'reg.php', {
		RUser: prefs.login,
		RPassword: prefs.password,
	}, addHeaders({Referer: baseurl + 'enter.php'}));
	
	if (!/Перейти к отчетам/i.test(html)) {
		var error = getParam(html, null, null, /<div[^>]+class="t-error"[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i, replaceTagsAndSpaces, html_entity_decode);
		if (error && /Неверный логин или пароль/i.test(error))
			throw new AnyBalance.Error(error, null, true);
		if (error)
			throw new AnyBalance.Error(error);
		throw new AnyBalance.Error('Не удалось зайти в личный кабинет. Сайт изменен?');
	}
	
	var href = getParam(html, null, null, /<a\s*href="([^"]*)">Перейти к отчетам/i);
	
	html = AnyBalance.requestGet(baseurl + href, g_headers);
	
	var result = {success: true};
	getParam(html, result, 'balance', /СУММА НА[\s\S]*?СУММА НА\s*\d{2}\.\d{2}\.\d{2,4}([\s\S]*?)</i, replaceTagsAndSpaces, parseBalance);
	
	AnyBalance.setResult(result);
}
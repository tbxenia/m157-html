const RECAPTCHA_KEY = '6LdOl9sZAAAAAPVwkhXPFU83bmOTWy_I_IbUpxSj'; // открытый ключ

function sendYaGoal($target = '') {
	if ( ! $target) {
		return false;
	}
	try {
		yaCounter4919965.reachGoal($target);
		console.log('reachGoal ' + $target);
	} catch (e) {
		console.log('Цель ' + $target + ' не отправлена');
		console.log( e.name );
		console.log( e.message );
	}
}

function addScriptToHead(src) {
	const script = document.createElement('script');
	script.src = src;
	document.head.appendChild(script);
}

function addCSSToHead(src) {
	const link = document.createElement('link');
	link.href = src;
	link.type = 'text/css';
	link.rel = 'stylesheet';
	document.head.appendChild(link);
}

// TODO: переделать в одну функцию getCookie
function get_cookie(cookie_name) {
	const results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
	if (results) {
		return (unescape(results[2]));
	}
	return null;
}

function getCookie(name) {
	const matches = document.cookie.match(new RegExp(
		'(?:^|; )' + name.replace(/([\.$?*|{}\()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

/**
 * для формы Подписаться на рассылку
 * @param token
 */
function onSubmitSubscribe(token) {

	let $subInput = $('#subscribe .subscribe-input'),
		$subPP = $('#subscribe input[name="pp"]'),
		$errBlock = $('#subscribe .err-block'),
		form_data = {
			'subscribe-input': $subInput.val(),
			'pp': $subPP.prop('checked')
		},
		subErr = false;

	const email = $subInput;

	$errBlock.empty();
	if (email.val() === undefined || email.val() === '') {
		subErr = true;
		$errBlock.append('<span class="err-block__item">Полe <b>email</b> обязательно для заполнения.</span>');
		$subInput.addClass('isErrInput');
	}

	subErr = checkEmailField(email, $errBlock);

	if ( ! $subPP.prop('checked')) {
		subErr = true;
		$errBlock.append('<span class="err-block__item">Вы не дали согласие на <b>обработку персональных данных.</b></span>');
	}

	if ( ! subErr) {
		$subInput.css('border', '0px solid #400');

		$.ajax({
			type: 'POST',
			url: '/engine/subscribe/index.php',
			data: form_data,
			success: function (code) {
				$errBlock.empty();

				code = Number(code);

				if (code === 1) {
					$('#subscribe').addClass('ok').html('Вы успешно подписаны!');
					sendYaGoal('subscribe_try');
				} else if (code === 2) {
					$errBlock.append('<span class="err-block__item">Некорректный email!</span>');
				} else if (code === 3) {
					$('#subscribe').addClass('ok').html('Вы уже подписаны!');
				} else if (code === 4) {
					$errBlock.append('<span class="err-block__item">Вы не дали согласие на обработку персональных данных.</span>');
				}
			}
		});
	}
}

// форма "Задать вопрос"
function onSubmitQuestion(token) {
	let $formQuestion = $('#write_quest'),
		name = $formQuestion.find('input[name="name"]'),
		lastname = $formQuestion.find('input[name="lastname"]'),
		email = $formQuestion.find('input[name="email"]'),
		phone = $formQuestion.find('input[name="phone"]'),
		comments = $formQuestion.find('textarea[name="comments"]'),
		$subPP = $formQuestion.find('input[name="pp"]'),
		$errBlock = $formQuestion.find('.err-block'),
		subErr = false,
		nameFields = {
			name: 'Имя',
			lastname: 'Фамилия',
			email: 'Электронная почта',
			phone: 'Контактный телефон',
			comments: 'Вопрос'
		};

	$errBlock.empty();
	[name, lastname, email, phone, comments].forEach((elem) => {
		if (elem.val() === undefined || elem.val() === '') {
			subErr = true;
			$errBlock.append(`<span class="err-block__item">Поле <b>${nameFields[elem.attr('name')]}</b> обязательно для заполнения.</span>`);
			elem.addClass('isErrInput');
		}
	});

	subErr = checkEmailField(email, $errBlock);

	if ( ! $subPP.prop('checked')) {
		subErr = true;
		$errBlock.append('<span class="err-block__item">Вы не дали согласие на <b>обработку персональных данных.</b></span>');
	}

	if ( ! subErr ) {
		const submitBtn = $formQuestion.find('input[type="submit"]');
		submitBtn.prop('disabled', true);

		submitBtn.closest('.question__submit').before('<div id="rev-form-send">Идёт отправка вопроса...</div>');

		$formQuestion.submit();
	}
}

function onSubmitFeedbackForm(token) {
	const $formReview = $('#zapis_na_priem');
	const $subPP = $formReview.find('input[name="fz152"]');
	const phone = $formReview.find('input[name="phone"]');
	const $errBlock = $formReview.find('.err-block');
	let err = false;

	sendYaGoal('enlist_try');

	$errBlock.empty();
	[phone].forEach((elem) => {
		if (elem.val() === undefined || elem.val() === '') {
			elem.addClass('isErrInput');
			$errBlock.append(`<span class="err-block__item">Поле <b>Ваш телефон</b> обязательно для заполнения.</span>`);
			if ( ! err ) {
				err = true;
			}
		}
	});

	if ( ! $subPP.prop('checked')) {
		err = true;
		$errBlock.append('<span class="err-block__item">Вы не дали согласие на <b>обработку персональных данных.</b></span>');
	}

	if (!err) {
		// Генерим рекапча токен и только потом отправляем данные
		if (typeof grecaptcha !== 'undefined') {
			grecaptcha.ready(function() {
				grecaptcha.execute(RECAPTCHA_KEY, {action: 'submit'}).then(function (token) {
					jQuery('#zapis_na_priem input[name="g-recaptcha"]').val(token);

					$formReview.attr('onsubmit', 'return true;');
					$formReview.trigger('submit');
				});
			});
		}
	} else {
		sendYaGoal('enlist_fail');
	}
}

// форма "Оставить отзыв"
function onSubmitReview(token) {
	sendYaGoal('review_try');
	let $formReview = $('#write_form'),
		surname = $formReview.find('input[name="fio"]'),
		name = $formReview.find('input[name="name"]'),
		phone = $formReview.find('input[name="phone"]'),
		email = $formReview.find('input[name="email"]'),
		comments = $formReview.find('textarea[name="comments"]'),
		$subPP = $formReview.find('input[name="pp"]'),
		$errBlock = $formReview.find('.err-block'),
		subErr = false,
		nameFields = {
			fio: 'Фамилия',
			name: 'Имя',
			comments: 'Текст сообщения',
			phone: 'Телефон',
			email: 'Email'
		};

	$errBlock.empty();

	[surname, name, comments, phone, email].forEach((elem) => {
		if (elem.val() === undefined || elem.val() === '') {
			subErr = true;
			$errBlock.append(`<span class="err-block__item">Поле <b>${nameFields[elem.attr('name')]}</b> обязательно для заполнения.</span>`);
			elem.addClass('isErrInput');
		}
	});

	if ( checkEmailField(email, $errBlock) ) {
		subErr = true;
	}

	if ( ! $subPP.prop('checked')) {
		subErr = true;
		$errBlock.append('<span class="err-block__item">Вы не дали согласие на <b>обработку персональных данных.</b></span>');
	}

	if ( ! subErr) {
		const data = $formReview.serialize();
		const submitBtn = $formReview.find('#submit_but');
		submitBtn.prop('disabled', true);

		submitBtn.closest('.question__submit').before('<div id="rev-form-send">Идёт отправка отзыва...</div>');
		$.ajax({
			url: '/crypt/add_otzivi.php',
			type: 'POST',
			data: data,
			success: function (respond, textStatus, jqXHR) {
				sendYaGoal('review_success');
				submitBtn.prop('disabled', false);
				$('#rev-form-send').remove();
				$formReview.before(`<div class="req_question__success">${respond}</div>`)
				$('#write_form .comments__item input, #write_form .comments__item textarea').val('');
				$formReview.hide();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				$('.send_resp').html('Ничего не вышло');
				console.log('ОШИБКИ AJAX запроса: ' + textStatus);
			}
		});
	}
}

function toggle_button(element) {
	if ($(element).prop('checked') == false) {
		$(element).closest('form').find('input[type="submit"]').prop('onclick', 'return false');
		$(element).closest('form').find('input[type="submit"]').prop('disabled', true);
	} else {
		$(element).closest('form').find('input[type="submit"]').removeProp('onclick');
		$(element).closest('form').find('input[type="submit"]').prop('disabled', false);
	}
}

/**
 * Убираем пункты верхнего меню, которые не вмещаются в строку, под '...'
 * task: 116862
 */
function topMenuResizer() {
	let topMenu = $('.header-top__menu'),
		topMenuWidth = topMenu.width(),
		isHidden = false,
		itemsMenu = topMenu.find('li:not(.menu-dropdown__item, .menu-more)'),
		itemsWidth = 0,
		wWidth = $(window).width();

	if ( topMenu.find('ul.mainmenu .menu-more').length > 0 ) {
		topMenu.find('ul.mainmenu .menu-more').remove();
		itemsMenu.removeClass('hide');
	}

	if ( wWidth > 766 && wWidth < 1190 ) {
		itemsMenu.each((i, item) => {
			let $item = $(item);
			itemsWidth += $item.width();
			if ((topMenuWidth - 34) < itemsWidth) {
				if ( ! isHidden) {
					isHidden = true;
				}
				$item.addClass('hide');
			}
		})
	}

	if ( isHidden ) {
		topMenu.find('ul.mainmenu').append(`<li class="menu-more"><span></span><ul class="menu-dropdown"></ul></li>`);
		topMenu.find('li.hide').clone().removeClass('hide').addClass('menu-dropdown__item').appendTo(topMenu.find('ul.menu-dropdown'))
	}
}

function choose_your_destiny() {
	const type_of_service = $('input[name=\'tabmenu\']:checked').val();
	switch (type_of_service) {
		case '1':
			$('#first').show();
			$('#second, #doctors_select').hide();
			break;
		case '3':
			$('#doctors_select').show();
			$('#second, #first').hide();
			break;
		default:
			$('#second').show();
			$('#first, #doctors_select').hide();
	}
}

// Проверяем содержимое на тип email
function validateEmail(email) {
	const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
	return re.test(String(email).toLowerCase());
}

// Валидация поля email
function checkEmailField(email, $errBlock) {
	if (!validateEmail(email.val())) {
		$errBlock.append(`<span class="err-block__item">Неправильно указана <b>Электронная почта</b></span>`);
		email.addClass('isErrInput');
		return true;
	}

	return false;
}

document.addEventListener('DOMContentLoaded', () => {
	const tabs = document.querySelectorAll('.main-tabs__tab');
	const sections = document.querySelectorAll('.main-tabs__section');

	if (tabs.length > 0 && sections.length > 0) {
		tabs.forEach(tab => {
			tab.addEventListener('click', e => {
				e.preventDefault();

				const target = tab.dataset.target;
				const section = document.querySelector(`.main-tabs__section.${target}`);
				if ( !section ) {
					return;
				}

				const isActiveTab = tab.classList.contains('active');

				if ( ! isActiveTab ) {
					const activeTab = document.querySelector('.main-tabs__tab.active');
					if ( activeTab ) {
						activeTab.classList.remove('active');
					}
					const activeSection = document.querySelector('.main-tabs__section.active');
					if ( activeSection ) {
						activeSection.classList.remove('active');
					}

					tab.classList.add('active');
					section.classList.add('active');
				}

				if (window.innerWidth <= 480) {
					const offsetTop = section.getBoundingClientRect().top + window.scrollY - 50;
					window.scrollTo({
						top: offsetTop,
						behavior: 'smooth'
					});
				}
			});
		});
	}
});

$(document).ready(function() {

	$('#subscribe-form').on('submit', function(e){
		e.preventDefault();
	})
	$('.subscribe-submit').on('click', onSubmitSubscribe);

	$(".left-menu-table .menu.has_children").click(function(e) {
		// Если нажали в 20 пикселях от правого края пункта вертикального меню, то делаем разворот, вместо перехода по ссылке
		const offset = $(this).offset(),
			x = e.pageX - offset.left,
			width = $(this).width();
		if (width - x < 20) {
			$(this).toggleClass("active");
			$(this).find(".dop-left-menu").toggleClass("current");
		}
	});

	// recaptcha -->
	let input = document.querySelectorAll('input, textarea');
	let recaptchaLoad = true; // чтобы загрузить библиотеку только один раз
	input.forEach(inputItem => {
		inputItem.addEventListener('focus', (e) => {
			if (recaptchaLoad) {
				let script = document.createElement('script');
				script.src = 'https://www.google.com/recaptcha/api.js?render=' + RECAPTCHA_KEY;
				script.async = true;
				document.body.append(script);
				recaptchaLoad = false;
			}
		});
	});
	// <-- recaptcha

	let faIcon = $('.fa, .far');
	if (faIcon.length > 0) {
		$('body').append('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.4.1/css/all.css" integrity="sha384-5sAR7xN1Nv6T6+dT2mhtzEpVJvfS3NScPQTrOxhwjIuvcA67KV2R5Jz6kr4abQsz" crossorigin="anonymous">');
	}

	$('[name="phone"]').mask('+7 (999) 999-9999');
	choose_your_destiny();

	$('input[name=\'tabmenu\']').change(function() {
		choose_your_destiny();
	});

	function includeScrollOrWait() {
		window.removeEventListener('scroll', includeScrollOrWait);
		clearTimeout(waitScrollOrWait);
        addScriptToHead('/engine/template/script/scroll_or_wait.js?q=1');
	}

	let waitScrollOrWait = setTimeout(includeScrollOrWait, 5000);
	window.addEventListener('scroll', includeScrollOrWait);

	topMenuResizer();
	$(window).resize(() => {
		topMenuResizer();
	});

	/* Цели --> */
	if (window.location.href.indexOf('/doctors/') != -1) {
		$('a[href$="feedback"]').live('click', function () {
			sendYaGoal('doctor-enlist_try');
		});
	}

	$('.shapka_tel a.maintel, .pred_btm .phn a, .footer-phone a').click(function () {
		sendYaGoal('telephone_main');
	});

	$('.shapka_tel a.stomtel').click(function () {
		sendYaGoal('telephone_stoma');
	});
	/* <-- Цели */

	if ($('.zapis_na_priem').length) {
		let tag = document.createElement('link');
		tag.rel = 'stylesheet';
		tag.type = 'text/css';
		tag.href = 'https://www.med157.ru/zapis_na_priem.css';
		document.head.appendChild(tag);
	}

	if ($('#zapis_na_priem').length) {
		$('#zapis_na_priem').fadeIn();
	}

	$('a.anchor').click(function () {
		$('html, body').animate({
			scrollTop: $($.attr(this, 'href')).offset().top - 80
		}, 400);
		return false;
	});


	$('[data-tn]').click(function () {
		var id = $(this).attr('data-tn');

		$('[data-tn]').removeClass('active');
		$('[data-tn="' + id + '"]').addClass('active');

		$('[data-tb]').removeClass('active');
		$('[data-tb="' + id + '"]').addClass('active');
	});

	let tableCell = $('.schedule_table.full .schedule_doc .day');
	if (tableCell.length > 0) {
		tableCell.each((i, e) => {
			let $this = $(e);
			if ($this.attr('data-schedident') !== '') {
				let text = $this.text().split(': ');
				let date = text[1].split('-');

				$this.html(`<span class="schedule_show_mobile">${text[0]}</span><span>${date[0]}</span>-<span>${date[1]}</span>`);
			}
		});
	}

	$(document).on('click', '.order-feedback, #tm_zapis', (e) => {
		/*
		 При нажатии на кнопку "Записаться" передаём
		 либо data-from из кнопки (если есть),
		 либо h1
		 через GET-параметр from
		 */
		e.preventDefault();

		const $this = $(e.target);
		const type = $this.data('type');
		let from = $this.data('from');

		let url = $this.attr('href');
		if ( ! url) {
			url = '/feedback';
		}

		if ( ! from) {
			from = $('.breadcrumbs ol li:last-child span span').text();
		}

		if ( ! from) {
			from = $('h1').text();
		}

		if (from) {
			from = from.toLowerCase();
			url += '?from=' + from;
			if (type === 'doc') {
				url += '&doctor=1';
			}
		}

		window.open(encodeURI(url), '_blank');
	});

	$('.med-load-more__btn').on('click', (elem) => {
		let pagination = $('.med-pagination__list'),
			doctorsBlock = $('.doctors_table'),
			currentPage = pagination.find('.current'),
			nextPage = currentPage.next(),
			isLast = nextPage.is(':last-of-type');

		$.ajax({
			'url': nextPage.attr('href'),
			'data': $('#doctors_form').serialize(),
			'beforeSend': (xhr) => {
				$(elem.target).prop('disabled', true);
			},
			'success': (data) => {
				let html = $(data),
					doctors = html.find('.doctors_033');

				$('.med-pagination__list').html(html.find('.med-pagination__list'));
				doctorsBlock.find('.clearfix').remove()
				doctorsBlock.append(doctors)
				doctorsBlock.append(`<div class="clearfix"></div>`);

				if ( isLast ) {
					$('.med-load-more').remove();
				} else {
					$(elem.target).prop('disabled', false);
				}
			}
		});
	});

	// New price under ATS
	if (getCookie('ats') === 'true') {
		$('.delete_ats').remove();
		$('.only_ats').show();

		// Переложи сюда $(".price-title").live("click", function() { если нужно закатить прайс обратно под АТС

	} else {
		$('.only_ats').remove();

		/* Скрипт, который запускает обработку excel данных для вывода в html */

		$('.price-title').live('click', function () {
			const $parent_li = $(this).closest('li');
			const $price_content = $parent_li.find('.price-content');

			$parent_li.toggleClass('price-active');

			// ajax должен выполниться только один раз, при первом развороте строки
			if ($parent_li.hasClass('price-active') && ! $price_content.hasClass('price-loaded')) {
				const path = $parent_li.find('.price-xls-link').attr('href');
				const index = $parent_li.index('.price-list li');

				$.ajax({
					data: 'path=' + path + '&index=' + index,
					type: 'POST',
					url: '/modules/ExcelToHTML/ExcelToHTMLNew.php',
					response: 'html',
					beforeSend: function () {
						$price_content.html('<center><img src=\'/modules/ExcelToHTML/wait_icon.gif\' /></center>');
					},
					success: function (msg) {
						let k = 0;
						$price_content.html(msg);
						$price_content.addClass('price-loaded'); // чтобы контент не грузился дважды
						$price_content.find('tr').each(function () {
							$s = $(this).find('td');
							var cond = false;
							if ($(this).hasClass('item') || $(this).hasClass('subitem')) {
								k += 1;
								$(this).show().attr('rel', 'tr' + k).css('cursor', 'pointer');
							}
							$('#sheet10').remove(); // убираем титульную страницу прайса
						});
					}
				});
			}
		});
	}

	$('div.see-all-categories-list').click(function () { // вопрос-ответ, развернуть список категорий полностью
		$('div.pre-categories-list').addClass('expanded'); 	// разворачиваем нужный div
		$(this).remove(); 									 // самоуничтожаемся
	});

	$('div.comment-item-see-full-answer').click(function () { // вопрос-ответ, развернуть ответ полностью
		$(this).prev().css('height', 'initial'); 			 // разворачиваем предыдущий div
		$(this).remove(); 									 // самоуничтожаемся
	});

	$('.prijom-block').on('click', '.country-phone-option', function () {
		$('#phone').val('+' + $(this).attr('data-phone') + ' ');
	});

	$('input[src*=srch_button]').click(function () {
		if ($('input[name=text]').attr('value') == 'Поиск') {
			return false;
		}
	});

	$('input[name=text]').focus(function () {
		if ($(this).attr('value') == 'Поиск') {
			$(this).attr('value', '');
		}
	});

	$('input[name=text]').blur(function () {
		if ($(this).val() == '') {
			$(this).attr('value', 'Поиск');
		}
	});

});

/*
 Скрипт, который запускает обработку excel данных для вывода в html
 */

$('.links span').live('click', function () {
	var path = $(this).next('a').attr('href');
	var index = $(this).closest('li').index('.links li');

	$.ajax({
		data: 'path=' + path + '&index=' + index,
		type: 'POST',
		url: '/modules/ExcelToHTML/ExcelToHTMLNew.php',
		response: 'html',
		beforeSend: function () {
			$('.cont').html('<center><img src=\'/modules/ExcelToHTML/wait_icon.gif\' /></center>');
		},
		success: function (msg) {
			//$(".cont").load("/modules/ExcelToHTML/"+ msg, function(){
			var k = 0;
			$('.cont').html(msg);
			//$(this).find(".gridlines").addClass("cont"+index);
			$('.cont' + index + ' tr').each(function () {
				$s = $(this).find('td');
				var cond = false;
				if ($(this).hasClass('item') || $(this).hasClass('subitem')) cond = true;

				if ( ! (cond)) {
					/*$(this).hide().addClass('tr'+k);*/
				} else {
					k += 1;
					$(this).show().attr('rel', 'tr' + k).css('cursor', 'pointer');
				}
				$('#sheet10').remove();//убираем титульную страницу прайса
			});
			//});

		}
	});
});


$('.cont tr').live('click', function () {
	var rel = $(this).attr('rel');

	if ($(this).hasClass('active')) {
		$('.cont .' + rel).hide();
		$(this).removeClass('active');
	} else {
		$('.cont .' + rel).show();
		$(this).addClass('active');
	}
});


$(document).ready(function () {

	// Скрипт для плавного скролла "с зазором сверху" при переходе по якорям с других страниц
	var myHash = location.hash; //получаем значение хеша

	if (myHash[1] != undefined) { //проверяем, есть ли в хеше какое-то значение
		location.hash = ''; //очищаем хеш
		$('html, body').animate(
			{scrollTop: $(myHash).offset().top - 100} // делаем отступ сверху, чтобы фиксированная шапка не перекрывала блок
			, 900); //скроллим
		location.hash = myHash; //возвращаем хеш
	}

	if ($('form').is('#send_res_form11')) {
		let vacForm = $('form#send_res_form11');
		let vacFile = vacForm.find('#file_resume');
		let vacCheck = vacForm.find('[type="checkbox"]');
		let vacBtn = vacForm.find('[name="send_resume"]');
		let vacErrB = $('#send_resume_outer_div .error-block');

		vacBtn.on('click', (e) => {
			let vacError = '';

			console.log('тык');
			if (vacFile.val() === '') {
				vacError += '<b>Ваше резюме не отправлено.</b><br>Не выбран файл.';
			}

			if ( ! vacCheck.prop('checked')) {
				if (vacError === '') {
					vacError += '<b>Ваше резюме не отправлено.</b><br>Вы не дали согласие на обработку персональных данных.';
				} else {
					vacError += '<br>Вы не дали согласие на обработку персональных данных.';
				}
			}

			if (vacError === '') {
				vacForm.submit();
			} else {
				vacErrB.html(vacError);
				e.preventDefault();
			}
		});

	}
});

// END файл script.js

function ChangeImgSize() {
	var div_three_pics_width = $('.div_three_pics').outerWidth();
	if (div_three_pics_width >= 300) {
		var new_pic_size = (div_three_pics_width - 15) / 3;
		new_pic_size = Math.floor(new_pic_size) - 5;
		$('.gallery_img_div').width(new_pic_size);
		$('.gallery_img_div img').width(new_pic_size);

		//while($('.gallery_img_div img').outerHeight()==0){
		var outer_hight_img = $('.gallery_img_div img').outerHeight() - 4;
		//}
		$('.gallery_img_div').height(outer_hight_img);
		//$('#test123test123').html('=====' + outer_hight_img);
	}
}

(function ($) {
	$.fn.replaceTagName = function (a) {
		var t = [];
		for (var i = this.length - 1; 0 <= i; i--) {
			var n = document.createElement(a);
			n.innerHTML = this[i].innerHTML;
			$.each(this[i].attributes, function (j, v) {
				$(n).attr(v.name, v.value);
			});
			$(this[i]).after(n).remove();
			t[i] = n;
		}
		return $(t);
	};
})(jQuery);


let isSlickLoaded = false;

function loadSlickLib(callback) {
	if ( ! isSlickLoaded) {
		isSlickLoaded = true;
		addScriptToHead('./js/slick/slick.min.js');
		addCSSToHead('./js/slick/slick.css');
		addCSSToHead('./js/slick/slick-theme.css');
	}
	let waitForSlick = setInterval(function () {
		if (typeof jQuery !== 'undefined' && typeof jQuery.fn.slick !== 'undefined') {
			clearInterval(waitForSlick);
			callback();
		}
	}, 500);
}

// Подключаем скрипт для поиска врачей
let isDoctorSearchHeadLoaded = false;
function loadDoctorSearchHead() {
	if ( !isDoctorSearchHeadLoaded) {
		isDoctorSearchHeadLoaded = true;
		addScriptToHead('/engine/template/script/doctor-search-header.js');
	}
}
$(document).click('.input-find-doctor', loadDoctorSearchHead);

$(document).ready(function () {

	let preferCheck = $('input.otziv_checkbox');

	preferCheck.change((e) => {
		preferCheck.removeAttr('checked');
		$(e.target).prop('checked', true);
	});

	$(document).on('focus', '.isErrInput', e => {
		$(e.target).removeClass('isErrInput');
	})

	if ($('.diplom_block').length > 0) {
		loadSlickLib(function () {
			diplomOpt = {
					dots: true,
					infinite: false,
					speed: 300,
					arrows: true,
					slidesToShow: 5,
					slidesToScroll: 5,
					responsive: [
						{
							breakpoint: 1180,
							settings: {
								slidesToShow: 3,
								slidesToScroll: 3,
								infinite: true,
								dots: false
							}
						},
						{
							breakpoint: 940,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 2
							}
						},
						{
							breakpoint: 767,
							settings: {
								slidesToShow: 3,
								slidesToScroll: 3
							}
						},
						{
							breakpoint: 480,
							settings: {
								slidesToShow: 2,
								slidesToScroll: 2
							}
						}
					]
				};

			$('.diplom_block').slick(diplomOpt);
		});
	}
	
	if ($('.gallery_block').length > 0) {
		loadSlickLib(function () {
			galleryBlock = {
					dots: true,
					infinite: false,
					speed: 300,
					arrows: true,
					slidesToShow: 1,
					slidesToScroll: 1,
				};

			$('.gallery_block').slick(galleryBlock);
		});
	}	
	
	if ($('.coverage__block').length > 0) {
		loadSlickLib(function () {
			coverageBlock = {
				dots: true,
				infinite: false,
				speed: 300,
				arrows: true,
				slidesToShow: 3,
				slidesToScroll: 3,
				responsive: [
					{
						breakpoint: 1180,
						settings: {
							slidesToShow: 3,
							slidesToScroll: 3,
							infinite: true,
							dots: false
						}
					},
					{
						breakpoint: 940,
						settings: {
							slidesToShow: 2,
							slidesToScroll: 2
						}
					},
					{
						breakpoint: 767,
						settings: {
							slidesToShow: 3,
							slidesToScroll: 3
						}
					},
					{
						breakpoint: 480,
						settings: {
							slidesToShow: 2,
							slidesToScroll: 2
						}
					}
				]
			};

			$('.coverage__block').slick(coverageBlock);
		});
	}

	if ($('.doctor-slide').length > 1) {
		loadSlickLib(function () {
			$('.doctors_slider').slick({
				infinite: true,
				slidesToShow: 2,
				slidesToScroll: 2,
				responsive: [
					{
						breakpoint: 1120,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1
						}
					}
				]
			});
		});
	}

	if ($('.accessible_environment').length > 0) {
		loadSlickLib(function () {
			$('.accessible_environment').slick({
				dots: false,
				infinite: true,
				speed: 300,
				arrows: true,
				slidesToShow: 3,
				slidesToScroll: 3,
				responsive: [
					{
						breakpoint: 1180,
						settings: {
							slidesToShow: 3,
							slidesToScroll: 3,
							infinite: true,
							dots: false
						}
					},
					{
						breakpoint: 940,
						settings: {
							slidesToShow: 2,
							slidesToScroll: 2
						}
					},
					{
						breakpoint: 767,
						settings: {
							slidesToShow: 2,
							slidesToScroll: 2
						}
					},
					{
						breakpoint: 480,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1
						}
					}
				]
			});
		});
	}

	$('.fancybox_contact').fancybox();

	let $div = $('div');
	let contactMapSelector = '.contacts-page__maps';
	let footerMap = '#map-container';

	if ($div.is(contactMapSelector)) {
		let mapScript = document.createElement('script');
		mapScript.type = 'text/javascript';
		mapScript.charset = 'utf-8';
		mapScript.defer = ! 0;
		mapScript.src = 'https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3Ab9c3f172cf58b3998ba2aed14f502c9fca1ae63badafa7498955151d680e71a9&height=382&lang=ru_RU&scroll=true&apikey=67b14f7b-5114-464e-abd8-7dbfcd5fdf71';


		showElementOnScroll(contactMapSelector, mapScript);
	}

	if ($div.is(footerMap)) {
		let footerMapScript = document.createElement('script');
		footerMapScript.src = 'https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3Ab9c3f172cf58b3998ba2aed14f502c9fca1ae63badafa7498955151d680e71a9&height=382&lang=ru_RU&scroll=true&apikey=67b14f7b-5114-464e-abd8-7dbfcd5fdf71';
		footerMapScript.type = 'text/javascript';
		footerMapScript.charset = 'utf-8';
		footerMapScript.defer = ! 0;

		showElementOnScroll(footerMap, footerMapScript);
	}

	$('.doctor_feedback_button').click(function() {
		$('.feedback-form-doctor').toggleClass('is_open');
	});

	$('.doctors-page-feedback-button').click(function() {
		$('.feedback-form-doctor').addClass('is_open');

		$('html, body').animate({
				scrollTop: $('.feedback-form-doctor').offset().top
		}, {
				duration: 370,
				easing: "linear"
		});
	});

	$('.burger_menu').click(function() {
		$('body').toggleClass('header_fixed');
	});

	$('.fixed_search').click(function() {
		$('.fixed_search .find-doctor').toggleClass('shown');
	});

	$('.schedule_dep').click(function() {
		var rows_to_toggle = $(this).attr('data-dep');
		$(this).toggleClass('open');
		$('.' + rows_to_toggle).toggleClass('shown');
	});

	$('#tomenu').click(function() {
		$('body').append('<div id="ajax-result"><div id="ajax-result-overly" onclick="$(\'#ajax-result\').remove(); closeSidebar();"></div><div id="ajax-result-content"></div></div>');
		$('.left-menu-blok').css('display', 'block');
		$('#close-menu').css('display', 'block');
		setTimeout('$(".left-menu-blok").css("left", "0px");', 100);
		$('body').css('overflow', 'hidden');
	});

	$('#close-menu').live('click', function() {
		setTimeout('$(".left-menu-blok").css("display", "none"); $("body").css("overflow","auto");', 100);
		$('.left-menu-blok').css('left', '-100%');
	});



	$.fn.scrollToTop = function() {
		var height = 457 + $('.middle .sidebar').height();
		$(this).hide().removeAttr('href');
		if ($(window).scrollTop() > height) {
			$(this).fadeIn('slow');
		}
		var scrollDiv = $(this);
		$(window).scroll(function() {
			if ($(window).scrollTop() < height) {
				$(scrollDiv).fadeOut('slow');
			} else {
				$(scrollDiv).fadeIn('slow');
			}
		});
		$(this).click(function() {
			$('html, body').animate({scrollTop: 0}, 'slow');
		});
	};

	$('#totop').scrollToTop();
	$('#totop').hover(
		function () {
			$('#totop').addClass('hover_r');
		},
		function () {
			$('#totop').removeClass('hover_r');
		}
	);

	$('a.fancybox123').fancybox();
	$('.licenses-gallery a').fancybox();

	$(window).resize(function () {
		ChangeImgSize();
	});

	var arr_links = new Map([
		['Терапия', 'https://www.med157.ru/doctors/therapeutist'],
		['Аллергология', 'https://www.med157.ru/doctors/allergolog'],
		['Гастроэнтерология', 'https://www.med157.ru/doctors/gastroenterologist'],
		['Кардиология', 'https://www.med157.ru/doctors/cardiologist'],
		['Пульмонология', 'https://www.med157.ru/doctors/cardiologist'],
		['Ревматология', 'https://www.med157.ru/doctors/revmatolog'],
		['Эндокринология', 'https://www.med157.ru/doctors/endocrynolog'],
		['Неврология', 'https://www.med157.ru/doctors/neurologist'],
		['Психотерапия', 'https://www.med157.ru/doctors/psihoterapevt'],
		['Семейная медицина', 'https://www.med157.ru/doctors/vop'],
		['Гинекология', 'https://www.med157.ru/doctors/gynaecologist'],
		['Дерматология', 'https://www.med157.ru/doctors/dermatolog'],
		['Оториноларингология', 'https://www.med157.ru/doctors/otolaryngologist'],
		['Офтальмология', 'https://www.med157.ru/doctors/ophthalmologist'],
		['Урология', 'https://www.med157.ru/doctors/urologist'],
		['Хирургия', 'https://www.med157.ru/doctors/surgeon'],
		['Травматология', 'https://www.med157.ru/doctors/travmatolog'],
		['Флебология', 'https://www.med157.ru/doctors/flebolog'],
		['Онкология', 'https://www.med157.ru/doctors/mammolog'],
		['Колонопроктология', 'https://www.med157.ru/doctors/proctologist'],
		['Физиотерапия', 'https://www.med157.ru/therapy/hirudotherapy'],
		['Массаж', 'https://www.med157.ru/therapy/massage'],
		['Мануальная терапия', 'https://www.med157.ru/therapy/manualtherapy'],
		['Рефлексотерапия', 'https://www.med157.ru/therapy/irt'],
		['ЛФК', 'https://www.med157.ru/therapy/exercise'],
		['Рентген', 'https://www.med157.ru/diagnostics/xray'],
		['УЗИ', 'https://www.med157.ru/diagnostics/ultra'],
		['Функциональня диагностика', 'https://www.med157.ru/diagnostics/ultrasonic'],
		['Эндоскопия', 'https://www.med157.ru/diagnostics/endoscopic'],
		['Компьютерная томография', 'https://www.med157.ru/diagnostics/kt'],
		['Лабораторные исследования', 'https://www.med157.ru/labs'],
		['Гематологические исследования', 'https://www.med157.ru/labs/price01'],
		['Исследования свертывающей системы крови', 'https://www.med157.ru/labs/issledovaniya'],
		['Биохимические исследования мочи', 'https://www.med157.ru/labs/price02'],
		['Исследование уровня онкомаркеров в крови', 'https://www.med157.ru/labs/price04'],
		['Исследование уровня аллергенов в крови', 'https://www.med157.ru/labs/price09'],
		['Бактериологические исследования', 'https://www.med157.ru/labs/price10'],
		['Исследования иммунного статуса', 'https://www.med157.ru/labs/price06'],
		['Гистологические исследования', 'https://www.med157.ru/labs/price15'],
		['Неонатальный скрининг', 'https://www.med157.ru/labs/price13'],
		['Исследования по диагностике ревматоидного артрита', 'https://www.med157.ru/labs/price05'],
		['Цитологические исследования', 'https://www.med157.ru/labs/price14'],
		['Комплексные лабораторные исследования', 'https://www.med157.ru/labs/price07'],
		['Процедуры', 'https://www.med157.ru/procunit'],
		['Стоматологический рентген', 'https://www.med157.ru/stomatology/xraydiagnostics'],
		['Стоматология терапия', 'https://www.med157.ru/stomatology/treatment'],
		['Стоматология пародонтология', 'https://www.med157.ru/stomatology/parodontology'],
		['Стоматология гигиена', 'https://www.med157.ru/stomatology/prophylaxis/profgigiena'],
		['Стоматология хирургия', 'https://www.med157.ru/stomatology/dentalsurgery'],
		['Стоматология имплантация', 'https://www.med157.ru/stomatology/implants'],
		['Стоматология ортопедия', 'https://www.med157.ru/stomatology/prosthesis'],
		['Несъемное протезирование', 'https://www.med157.ru/stomatology/prosthesis/necyomnoe'],
		['Съемное протезирование', 'https://www.med157.ru/stomatology/prosthesis/cyomnoe'],
		['Стоматология ортодонтия', 'https://www.med157.ru/stomatology/ortodontic'],
		['Стоматология дети', 'https://www.med157.ru/forkids/kidsstom'],
		['Педиатрия', 'https://www.med157.ru/forkids/pediatr'],
		['Аллергология дети', 'https://www.med157.ru/forkids/allergolog'],
		['Неврология дети', 'https://www.med157.ru/forkids/kidsnevrologist'],
		['Дерматология дети', 'https://www.med157.ru/forkids/kidsdermatolog'],
		['Оториноларингология дети', 'https://www.med157.ru/forkids/kidslor'],
		['Офтальмология дети', 'https://www.med157.ru/forkids/kidsoftalmolog'],
		['Травматология дети', 'https://www.med157.ru/forkids/kidstravmatolog'],
		['Физиотерапия дети', 'https://www.med157.ru/forkids/reabilitation'],
		['Рентген дети', 'https://www.med157.ru/forkids/diagnostics/rentgen'],
		['УЗИ', 'https://www.med157.ru/forkids/diagnostics/uzikids'],
		['Компьютерная томография дети', 'https://www.med157.ru/forkids/diagnostics/kt']
	]);

	String.prototype.capitalize = function(lower) {
		return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function (a) {
			return a.toUpperCase();
		});
	};

	$('.price-list-row').on('click', function() {

		var button_el = $(this);

		setTimeout(function () {
			let table = button_el.find('.price');

			table.find('tr td:first-child').each(function() {
				let otd = $(this).html();
				let otd_orig = otd;
				otd = otd.toLowerCase();
				otd = otd.charAt(0).toUpperCase() + otd.slice(1);

				let link_text = arr_links.get(otd);

				if (link_text != undefined) {
					$(this).html(`<a href=${link_text}>${otd_orig}</a>`);
				}
			});

		}, 1000);
	});


	$('#triple-menu #tm_ruble').click( () => {

		let headerH = 10;
		if ( $(window).width() > 1024 ) {
			headerH = 22 + $('header.header .header-top').outerHeight();
		}

		setTimeout(function () {
			$('html, body').animate({
				scrollTop: $(
					'h3:contains(\'Цены\'), ' +
					'h2:contains(\'Цены\'), ' +
					'h3:contains(\'цены\'), ' +
					'h2:contains(\'цены\'), ' +
					'h3:contains(\'стоимость услуг\'), ' +
					'h2:contains(\'стоимость услуг\'),' +
					'strong:contains(\'Клинические анализы\'),' +
					'table.price'
				).offset().top - headerH
			}, 1000);
		}, 100);
	});

});


$(function () {
	var cur_date = new Date();
	cur_date.setDate(cur_date.getDate());

	try {
		$('.datepic').datepicker({format: 'dd-mm-yyyy', minDate: cur_date});
	} catch (error) {
		console.warn('Отключена библиотека datepicker! вернуть, если понадобится');
	}


	if (typeof $.datepicker !== 'undefined') {
		$.datepicker.regional['ru'] = {
			closeText: 'Закрыть',
			prevText: '&#x3c;Пред',
			nextText: 'След&#x3e;',
			currentText: 'Сегодня',
			monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
				'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
			monthNamesShort: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
				'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
			dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
			dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
			dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
			weekHeader: 'Нед',
			dateFormat: 'dd.mm.yy',
			firstDay: 1,
			minDate: cur_date,
			isRTL: false,
			showMonthAfterYear: false,
			yearSuffix: ''
		};
		$.datepicker.setDefaults($.datepicker.regional['ru']);
	}

	$('#time').mask('99:99');
});

function CheckForm() {
	if (
		document.add.name.value == 0 ||
		document.add.comments.value == 0 ||
		document.add.phone.value == 0 ||
		document.add.code.value == 0
	) {
		alert('Не заполнено обязательное поле!');
		return false;
	} else {
		document.forms.add.submit();
	}
}

$('#search-form').on('submit', function(e) {
	e.preventDefault();

	var data = $(this).serializeArray();
	var searchId;
	var searchText;

	searchId = data[0].value;
	searchText = encodeURI(data[3].value);
	location.href = '/search?searchid=' + searchId + '&text=' + searchText + '&web=0';

	sendYaGoal('search_form_submit');
});

$('form[action="/doctor-search"] button').on('click', function() {
	sendYaGoal('find_doctor_submit');
});


/**
 * Появление элемента при скроллинге страницы
 *
 * Сначала создаем элемент, который передаём уже в функцию
 *
 * Например:
 * let mapScript = document.createElement('script');
 *     mapScript.type = 'text/javascript';
 * 	   mapScript.defer = !0;
 * 	   mapScript.src = 'https://site.name/script.js';
 *
 * showElementOnScroll(contactMapSelector, mapScript);
 *
 * @param selector - Класс или ID блока, в который вставляем элемент ('.class', '#id')
 * @param appendElement - Элемент который вставляем в блок
 * @param offset - отступ до блока, при котором должен начать появляться элемент
 */
function showElementOnScroll(selector, appendElement, offset = 500) {
	let wh = $(window).height(),
		et = $(selector).offset().top,
		showElement = true;

	$(window).scroll(function() {
		let wt = $(window).scrollTop();

		if (wt + wh + offset >= et || wt + wh + offset > 3000) {
			if (showElement) {
				console.log(`Элемент ${selector} показан`);
				document.querySelector(selector).append(appendElement);
				showElement = false;
			}
		}
	});
}

// Добавление якорной навигации на страницах врачей
function createAnchorNavigation() {
	const titles = $('.navigation-target');
	const targetWrap = $('.doctors-page-navigation');
	const ul = $('<ul class="anchor-nav"></ul>');
	let id = 0;

	$(titles).each( (i,elem) => {
		let title = $(elem).data('navigation_title');
		$(elem).attr('id', `id-${id}`);
		let target = `id-${id}`;
		let navElem = $(`<li><button class="anchor-nav-elem" data-target=${target}>${title}</button></li>`);
		ul.append(navElem);
		id++;
	});
	if (targetWrap.length > 0) {
		targetWrap.append(ul);
	}
}

$(document).ready(createAnchorNavigation);

$(document).on('click', '.anchor-nav-elem', function(e) {
  e.preventDefault();
  const id = $(this).data('target');
  $("html, body").animate({
      scrollTop: $(`#${id}`).offset().top - 80
  }, {
      duration: 370,
      easing: "linear"
  });
});

const cookieWindow = document.getElementById("cookie-rules");
const cookieAcceptBtn = document.getElementById("agree-cookie");

const acceptCookie = () => {
  localStorage.setItem("cookieClosed", true);
  if (cookieWindow) {
    cookieWindow.classList.add("accepted");
    cookieAcceptBtn.removeEventListener("click", acceptCookie);
  }
};

if (cookieWindow) {
	if ( ! localStorage.getItem('cookieClosed')) {
		// Если предупреждение еще не закрывали, показываем его
		setTimeout(() => {
			cookieWindow.classList.add('shown');
		}, 1000);

		if (cookieAcceptBtn) {
			cookieAcceptBtn.addEventListener('click', acceptCookie);
		}
	}
}

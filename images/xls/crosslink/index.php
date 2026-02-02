<?
header('Content-Type: text/html; charset=utf-8');
include('PHPExcel.php');
include('PHPExcel/IOFactory.php');
$objPHPExcel = PHPExcel_IOFactory::load("med157.xls");
//количество листов (нам нужен только один)
foreach ($objPHPExcel->getWorksheetIterator() as $worksheet) {
	//определяем количество строк
	$MaxRow = $worksheet->getHighestRow();

	$data = array(); // json array

	//бежим по всем строкам (начиная со 2-ой, поскольку первая строка заголовок таблицы)
	for ($row = 2; $row <= $MaxRow; $row++) {
		$innerArray = array(); 
		$url = clearUrl($worksheet->getCellByColumnAndRow(0, $row)->getValue());
		if (!empty($url)) {
			$innerArray[$url]['link']   = clearUrl($worksheet->getCellByColumnAndRow(1, $row)->getValue());
			$innerArray[$url]['anchor'] = $worksheet->getCellByColumnAndRow(2, $row)->getValue();
			$innerArray[$url]['img']    = clearUrl($worksheet->getCellByColumnAndRow(3, $row)->getValue());
			$data[] = $innerArray;
		}
	}

	$fp = fopen('results.json', 'w');
	fwrite($fp, json_encode($data));
	fclose($fp);


	$json = file_get_contents('results.json');
	$result = json_decode($json);

	$currentUrl = "/obshhestvennye-pomeshheniya.php";

	foreach ($result as $key => $value) {
		foreach ($value as $url => $params) {
			if ($url == $currentUrl) {
				echo "<pre>";
				echo $params->link;
				echo $params->anchor;
				echo $params->img;
				echo "</pre>";
				break;
			}
		}
	}

	break;
}

//убираем из url имя домена
function clearUrl($url) {
	if (substr_count($url, '//')) {
		$url = str_replace("//", "", $url);
		$url = stristr($url, '/');
	} 
	return $url;
}

/*
	function hasCrossLink($result, $currentUrl) {
		foreach ($result as $key => $value) {
			foreach ($value as $url => $params) {
				if ($url == $currentUrl) {
					return true;
				}
			}
		}
		return false;
	}

	$currentUrl = $_SERVER['REQUEST_URI'];
	$json = file_get_contents($_SERVER['DOCUMENT_ROOT'].'/laminat_02_10_2014.json');
	$result = json_decode($json);
	if (hasCrossLink($result, $currentUrl)):?>
	<div class="clear"></div>
	<div id="linksBlock">
		<div class="linkHd">Вас также могут заинтересовать:</div>
		<?
		foreach ($result as $key => $value) {
			foreach ($value as $url => $params) {
				if ($url == $currentUrl) {?>
					<div class="lefft">
						<a href="<?=$params->link?>">
							<img src="<?=$params->img?>">
							<div><?=iconv("UTF-8", "cp1251", $params->anchor)?></div>
						</a>
					</div>
					<?break;
				}
			}
		}
		?>
	</div>
	<?endif;?>


	-----------вставка в функцию-------------
	function cross_links() {
		if ( array_key_exists('ats', $_COOKIE) && ($_COOKIE['ats'] == 'true')) {
			$currentUrl = $_SERVER['REQUEST_URI'];
			$json = file_get_contents("http://kolinkor.ru/wp-content/themes/shablon/js/crosslink.json");
			$result = json_decode($json);
			if (hasCrossLink($result, $currentUrl)) {
				$html = '<div id="linksBlock">';
					$html .= '<div class="linkHd">Вас также могут заинтересовать:</div><div>';
					foreach ($result as $key => $value) {
						foreach ($value as $url => $params) {
							if ($url == $currentUrl) {
								$html .= '<div class="lefft">';
									$html .= '<a href="'.$params->link.'">';
										$html .= '<div class="img_blokk"><img src="'.$params->img.'"></div>';
										$html .= '<p>'.$params->anchor.'</p>';
									$html .= '</a>';
								$html .= '</div>';
								break;
							}
						} 
					}
					
				$html .= '</div></div>';
			}
			return $html;
			
		}
	}




<style>
	#linksBlock {
		margin-top: 20px;
		overflow: hidden;
	}
	.linkHd {
		font-weight: bold;
		padding: 10px 10px 10px 15px;
	}
	#linksBlock .lefft {
		width: 33%;
		text-align: center;
	}
	.lefft {
		float: left;
		overflow: hidden;
	}
	#linksBlock img {
		width: 125px;
		height: 95px;
		padding: 5px;
		border: solid 1px #CFC9C9;
		box-shadow: 2px 2px 4px #8D8888;
		margin: 10px;
	}
</style>
*/



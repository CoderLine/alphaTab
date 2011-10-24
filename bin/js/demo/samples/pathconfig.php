<?php 
/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */

// environment 
//   DEV --> Development environment (repository checkout)
//   WP  --> Wordpress   (alphaTab Website)
define('ENVIRONMENT_DEV', 'DEV');
define('ENVIRONMENT_WP', 'WP');
define('ENVIRONMENT', ENVIRONMENT_DEV);

$alphaTabPath = ''; // url to use for script tags for alphaTab inclusion
$filePath = ''; // url where to find the demo files

if(ENVIRONMENT == ENVIRONMENT_DEV) {
    $alphaTabPath = '../lib/alphaTab';
    $filePath = 'files';
}
elseif(ENVIRONMENT == ENVIRONMENT_WP) {
    $wp_root_url = trim(get_bloginfo("wpurl"), '/');
    $alphaTabPath = $wp_root_url . '/wp-content/plugins/alphaTab/js/alphaTab';
    $filePath = $wp_root_url . '/wp-content/demo-files';
}

?> 
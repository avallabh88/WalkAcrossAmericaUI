/**
 * Created by avallabhaneni on 8/18/2016.
 */
import angular from 'angular';
import constants from '../constants'

export default class SiteService {

    /**
     * The parametrized constructor for Site service class.
     *
     * @param $http The $http Service.
     *
     */
    constructor($http) {
        this.$http = $http;
    }


    /**
     * Service method to get the site id.
     *
     *
     * @returns The name of the Site Image.
     */
    getSiteIdByToolId(toolId) {
        var hostname = window.location.hostname;
        var hostAddress = "http://" + hostname + ":8081"
        return this.$http.get(hostAddress+"/dashboard/tools/" + toolId)
            .then(response => {
                return response.data.site.siteId;
            });
    }


}
SiteService.$inject = ['$http'];
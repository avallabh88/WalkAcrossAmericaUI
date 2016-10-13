/**
 * Created by avallabhaneni on 8/16/2016.
 */
export default class HostNameService {

    getHostName() {
        var hostname = window.location.hostname;
        var hostAddress = "http://" + hostname + ":8081";
        return hostAddress;
    }


}